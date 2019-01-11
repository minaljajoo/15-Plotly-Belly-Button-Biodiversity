# Unit 15 | Assignment - Belly Button Biodiversity: Visualizations-and-Dashboards:JavaScript file
import os

import pandas as pd
import numpy as np
# Import SQLAlchemy `automap` and other dependencies here
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool
from sqlalchemy import create_engine
# Import flask 'Flask' and other dependencies
from flask import Flask, jsonify, render_template
#from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

#################################################
# Database Setup
#################################################
#app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///db/belly_button_biodiversity.sqlites"
#db = SQLAlchemy(app)

# reflect an existing database into a new model
#Base = automap_base()
# reflect the tables
#Base.prepare(db.engine, reflect=True)


engine = create_engine("sqlite:///db/belly_button_biodiversity.sqlite")
# Reflect Database into ORM class
Base = automap_base()
Base.prepare(engine, reflect=True)
# Save references to each table
Samples_Metadata = Base.classes.samples_metadata
Samples = Base.classes.samples
Otu = Base.classes.otu
# Start a session to query the database
session = Session(engine)

################################################
@app.route("/")
def index():
    """Return the homepage."""
    return render_template("index.html")

#-----------------------------------------
@app.route("/names")
def names():
    """Return a list of sample names."""
    print("name")
    # Use Pandas to perform the sql query
    stmt = session.query(Samples).statement
    df = pd.read_sql_query(stmt,session.bind)
    df.set_index('otu_id',inplace=True)
    
    
    # Return a list of the column names (sample names)
    return jsonify(list(df.columns))

#-----------------------------------------
@app.route("/metadata/<sample>")
def sample_metadata(sample):
    
    """Return the MetaData for a given sample."""
    sel = [Samples_Metadata.AGE, 
        Samples_Metadata.BBTYPE,
        Samples_Metadata.ETHNICITY, 
        Samples_Metadata.GENDER,
        Samples_Metadata.LOCATION, 
        Samples_Metadata.WFREQ,
        Samples_Metadata.SAMPLEID]
    meta_result = session.query(*sel).filter(
    Samples_Metadata.SAMPLEID == sample).all()

    # Create a dictionary entry for each row of metadata information
    sample_metadata = {}
    for result in meta_result:
        sample_metadata["AGE"] = result[0]
        sample_metadata["BBTYPE"] = (result[1]).upper()
        sample_metadata["ETHNICITY"] = result[2]
        sample_metadata["GENDER"] = result[3]
        sample_metadata["LOCATION"] = result[4]  
        sample_metadata["WFREQ"] = result[5] 
        sample_metadata["SAMPLEID"] = result[6]
   
    return jsonify(sample_metadata)
#-----------------------------------------

@app.route("/samples/<sample>")
def samples(sample):
    """Return `otu_ids`, 'out_labels' and `sample_values`."""
     # Use Pandas to perform the sql query on Samples
    
    stmt = session.query(Samples).statement
    df = pd.read_sql_query(stmt,session.bind)
    # Set index to 'otu_id'
    df.set_index('otu_id',inplace = True)
    # Filter the data based on the sample number and
    # only keep rows with values above 1 and also store in decending order 
    #print(df)
    sample_df = df[df[sample]>1]
    new_df =sample_df.sort_values(by=sample, ascending=False)
    sample_data = pd.DataFrame({'sample':new_df[sample]})
    # Use Pandas to perform the sql query on Otu
    otu_stmt = session.query(Otu).statement
    otu_df = pd.read_sql_query(otu_stmt,session.bind)
    # Set index to 'otu_id'
    otu_df.set_index('otu_id',inplace = True)   
    # merge database
    out_id_label_df = pd.merge(sample_data,otu_df, on="otu_id", how = "left")

    # Format the data to send as json
    data = [{
    "otu_ids": out_id_label_df.index.values.tolist(),
    "sample_values": out_id_label_df['sample'].values.tolist(),
    "otu_label": out_id_label_df['lowest_taxonomic_unit_found'].values.tolist()
}]
    
    return jsonify(data)


################################################
if __name__ == "__main__":
    app.run()

################################################