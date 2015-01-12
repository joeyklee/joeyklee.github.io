import pandas as pd
import numpy as np
import re

from geopandas import GeoDataFrame


def fixheaders(df):
	output = [re.sub('[^A-Za-z0-9]+', '', i) for i in df.columns]
	return output

def main():
	# read in data and fix headers
	data = pd.read_csv('/Users/Jozo/Dropbox/UBC/cirs/energyexplorer/data/optimized/energy/consumption/ceei_2010_metrovan.csv')
	data.columns = fixheaders(data)

	# electricity (mostly renewable), heating fuel (fossil fuels), & transporation (fossil fuels) by LocalGovtName
	groupedData =data.groupby(['LocalGovtName', 'LocalGovtType', 'MeasurementDesc', 'Sector'])['EnergyGJ'].sum()
	groupedData.to_csv('/Users/Jozo/Dropbox/UBC/cirs/energyexplorer/data/optimized/energy/consumption/ceei_2010_metrovan_grouped.csv')

	# read in grouped data
	newdata = pd.read_csv('/Users/Jozo/Dropbox/UBC/cirs/energyexplorer/data/optimized/energy/consumption/ceei_2010_metrovan_grouped.csv', header=False)
	newdata.columns = ['city','ctype', 'sector', 'desc', 'consump']

	# Add in metro vancouver names:
	newdata['metroname'] = pd.Series()

	for i in np.arange(0,len(newdata), 1):
		if newdata.ctype[i] == 'City' or newdata.ctype[i] == 'Village':
			newdata.metroname[i] = str(newdata.ctype[i] + " of " + newdata.city[i])

		elif newdata.city[i] == 'Delta' or newdata.city[i] == 'Langley' and newdata.ctype[i] == 'District Municipality':
			newdata.metroname[i] = str('Township' + " of " + newdata.city[i])

		elif newdata.city[i] == 'Maple Ridge' or newdata.city[i] == 'North Vancouver' or newdata.city[i] == 'West Vancouver'  and newdata.ctype[i] == 'District Municipality':
			newdata.metroname[i] = str('District' + " of " + newdata.city[i])

		elif newdata.city[i] == 'Bowen Island' and newdata.ctype[i] == 'Island Municipality':
			newdata.metroname[i] = str('Village' + " of " + newdata.city[i])

		elif newdata.city[i] == 'Metro-Vancouver' and newdata.ctype[i] == 'Regional District Unincorporated Areas':
			newdata.metroname[i] = str('Electoral Area A')

		elif newdata.city[i] == 'Metro-Vancouver' and newdata.ctype[i] == 'Regional District':
			newdata.metroname[i] = str(newdata.city[i] + " " + newdata.ctype[i])

	newdata.to_csv('/Users/Jozo/Dropbox/UBC/cirs/energyexplorer/data/optimized/energy/consumption/ceei_2010_metrovan_grouped_metronames.csv')

	# Pivot data
	newdata_pivot =newdata.pivot(index = 'metroname',columns ='sector', values='consump')
	#fill na with 0
	newdata_pivot = newdata_pivot.fillna(0)
	# fix columns
	newdata_pivot.columns = fixheaders(newdata_pivot)
	newdata_pivot.to_csv('/Users/Jozo/Dropbox/UBC/cirs/energyexplorer/data/optimized/energy/consumption/ceei_2010_metrovan_grouped_metronames_formatted.csv', index='metroname')

	''' --- merge with shapefile --- '''
	metrovan =  GeoDataFrame.from_file('/Users/Jozo/Dropbox/UBC/CIRs/EnergyExplorer/data/optimized/metroVan/metroVan.shp')
	joindata = pd.read_csv('/Users/Jozo/Dropbox/UBC/cirs/energyexplorer/data/optimized/energy/consumption/ceei_2010_metrovan_grouped_metronames_formatted.csv', header=False)

	output = GeoDataFrame.merge(metrovan, joindata, left_on="NAMEMUNI", right_on="metroname")
	outputcol = [i for i in joindata.columns]
	outputcol.append('geometry')

	output = output[outputcol]

	output.to_file('/Users/Jozo/Dropbox/UBC/CIRs/EnergyExplorer/data/optimized/energy/consumption/ceei_2010/ceei_2010_metrovan_formatted.shp')
	# output.to_json('/Users/Jozo/Dropbox/UBC/CIRs/EnergyExplorer/data/optimized/energy/consumption/ceei_2010/ceei_2010_metrovan_formatted')

'''
# read in data
data = pd.read_csv('/Users/Jozo/Dropbox/UBC/cirs/energyexplorer/data/optimized/energy/consumption/ceei_2010_metrovan.csv')
# remove special characters from headers
data.columns = [re.sub('[^A-Za-z0-9]+', '', i) for i in data.columns]


# electricity (mostly renewable), heating fuel (fossil fuels), & transporation (fossil fuels) by LocalGovtName
groupedData =data.groupby(['LocalGovtName', 'LocalGovtType', 'MeasurementDesc', 'Sector'])['EnergyGJ'].sum()

# write out to file
groupedData.to_csv('/Users/Jozo/Dropbox/UBC/cirs/energyexplorer/data/optimized/energy/consumption/ceei_2010_metrovan_grouped.csv')

newdata = pd.read_csv('/Users/Jozo/Dropbox/UBC/cirs/energyexplorer/data/optimized/energy/consumption/ceei_2010_metrovan_grouped.csv', header=False)
newdata.columns = ['city','ctype', 'sector', 'desc', 'consump']

# rename data:
newdata['metroname'] = pd.Series()

for i in np.arange(0,len(newdata), 1):
	if newdata.ctype[i] == 'City' or newdata.ctype[i] == 'Village':
		newdata.metroname[i] = str(newdata.ctype[i] + " of " + newdata.city[i])

	elif newdata.city[i] == 'Delta' or newdata.city[i] == 'Langley' and newdata.ctype[i] == 'District Municipality':
		newdata.metroname[i] = str('Township' + " of " + newdata.city[i])

	elif newdata.city[i] == 'Maple Ridge' or newdata.city[i] == 'North Vancouver' or newdata.city[i] == 'West Vancouver'  and newdata.ctype[i] == 'District Municipality':
		newdata.metroname[i] = str('District' + " of " + newdata.city[i])

	elif newdata.city[i] == 'Bowen Island' and newdata.ctype[i] == 'Island Municipality':
		newdata.metroname[i] = str('Village' + " of " + newdata.city[i])

	elif newdata.city[i] == 'Metro-Vancouver' and newdata.ctype[i] == 'Regional District Unincorporated Areas':
		newdata.metroname[i] = str('Electoral Area A')

	elif newdata.city[i] == 'Metro-Vancouver' and newdata.ctype[i] == 'Regional District':
		newdata.metroname[i] = str(newdata.city[i] + " " + newdata.ctype[i])

newdata.to_csv('/Users/Jozo/Dropbox/UBC/cirs/energyexplorer/data/optimized/energy/consumption/ceei_2010_metrovan_grouped_metronames.csv')


# pivot
newdata_pivot =newdata.pivot(index = 'metroname',columns ='sector', values='consump')

#fill na with 0
newdata_pivot = newdata_pivot.fillna(0)
# fix columns
newdata_pivot.columns = [re.sub('[^A-Za-z0-9]+', '', i) for i in newdata_pivot.columns]
newdata_pivot.to_csv('/Users/Jozo/Dropbox/UBC/cirs/energyexplorer/data/optimized/energy/consumption/ceei_2010_metrovan_grouped_metronames_formatted.csv', index='metroname')


metrovan =  GeoDataFrame.from_file('/Users/Jozo/Dropbox/UBC/cirs/energyexplorer/data/optimized/metroVan/formatted_metroVan.shp')
joindata = pd.read_csv('/Users/Jozo/Dropbox/UBC/cirs/energyexplorer/data/optimized/energy/consumption/ceei_2010_metrovan_grouped_metronames_formatted.csv', header=False)

output = GeoDataFrame.merge(metrovan, joindata, left_on="NAMEMUNI", right_on="metroname")
outputcol = [i for i in joindata.columns]
outputcol.append('geometry')

output = output[outputcol]

output.to_file('/Users/Jozo/Dropbox/UBC/CIRs/EnergyExplorer/data/optimized/energy/consumption/ceei_2010/ceei_2010_metrovan_formatted.shp')
output.to_json('/Users/Jozo/Dropbox/UBC/CIRs/EnergyExplorer/data/optimized/energy/consumption/ceei_2010/ceei_2010_metrovan_formatted')

'''
