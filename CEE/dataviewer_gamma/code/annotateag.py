from geopandas import GeoDataFrame
import numpy as np


data = GeoDataFrame.from_file('/Users/Jozo/Dropbox/UBC/cirs/energyexplorer/data/optimized/energy/ag/formatted_MV_Ag_Parcels.shp')

data['cat'] = 'null'

for i in np.arange(0, len(data), 1):
	if data.use_code[i] =='110' or data.use_code[i] =='120' or data.use_code[i] =='130' or data.use_code[i] =='140' or data.use_code[i] =='190' :
		data.cat[i] = "Other and Vegetation"
	elif data.use_code[i] =='180' or data.use_code[i] == '181' :
		data.cat[i] = "Mixed Vegetation and Livestock"
	elif data.use_code[i] =='150' or data.use_code[i] =='151' or data.use_code[i] =='160' or data.use_code[i] =='161' or data.use_code[i] =='170' or data.use_code[i] =='171' :
		data.cat[i] = "Livestock Only"
	else:
		data.cat[i] = "other"

data.to_file('/Users/Jozo/Dropbox/UBC/cirs/energyexplorer/data/optimized/energy/ag/formatted_MV_Ag_Parcels_annotated.shp')
