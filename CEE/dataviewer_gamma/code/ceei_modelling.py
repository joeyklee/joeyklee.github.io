import pandas as pd
import numpy as np
import re

from geopandas import GeoDataFrame
import geocoder

# read in data
data = pd.read_csv('/Users/Jozo/Dropbox/UBC/cirs/energyexplorer/data/optimized/energy/consumption/ceei_2010_metrovan.csv')
# remove special characters from headers
data.columns = [re.sub('[^A-Za-z0-9]+', '', i) for i in data.columns]


# electricity (mostly renewable), heating fuel (fossil fuels), & transporation (fossil fuels) by LocalGovtName
groupedData =data.groupby(['LocalGovtName','MeasurementDesc', 'Sector'])['EnergyGJ'].sum()

groupedData.to_csv('/Users/Jozo/Desktop/test.csv')


''' ------------- '''
newdata = pd.read_csv('/Users/Jozo/Desktop/test.csv', header=False)
newdata.columns = ['city', 'sector', 'desc', 'consump']
newdata_pivot =newdata.pivot(index = 'city',columns ='sector', values='consump')

newdata_pivot = newdata_pivot.fillna(0)
newdata_pivot.to_csv('/Users/Jozo/Desktop/test_pivot.csv', index='city')


geodat = pd.read_csv('/Users/Jozo/Desktop/test_pivot.csv')
lat = []
lng = []
for i in geodat.city:
	lat.append(g(i + " ,BC, Canada").latlng[0])
	lng.append(g(i + " ,BC, Canada").latlng[1])

geodat['lat'] = pd.Series(lat)
geodat['lng'] = pd.Series(lng)

geodat.to_csv('/Users/Jozo/Desktop/test_pivot_geo.csv')

''' ------------- '''
metrovan =  GeoDataFrame.from_file('/Users/Jozo/Dropbox/UBC/cirs/energyexplorer/data/optimized/metroVan/formatted_metroVan.shp')



g = geocoder.google


