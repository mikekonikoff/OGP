if (typeof org == 'undefined'){
	org = {};
} else if (typeof org != "object"){
	throw new Error("org already exists and is not an object");
}

// Repeat the creation and type-checking code for the next level
if (typeof org.fgdl == 'undefined'){
	org.fgdl = {};
} else if (typeof org.OpenGeoPortal != "object"){
    throw new Error("org.OpenGeoPortal already exists and is not an object");
}


//var pathToDwrServlet = "http://gp/est/dwr"; // Path to dwr on foreign domain

org.fgdl.LayerBrowser = function(){
	var self = this;
	self.issues = ko.observableArray();

	self.isInited = ko.observable(false);

	self.init = function () {
		if (self.isInited()) return;
		self.isInited(true);
		// load issues from server
		//Issue._path = "http://gp/est/dwr";
		//jQuery.blockUI({message: "<br /><img src='/est/images/load.gif' />Loading...<br /><br />"});
		Issue.listEtatIssues(function(reply) {
			//jQuery.unblockUI();

			for (var i = 0; i < reply.length; i++) {
				self.issues.push(new org.fgdl.EtdmIssue(reply[i]));
			}
		});
	};

	self.isLoading = ko.observable(false);

	self.selectedIssue = ko.observable(null);

	self.selectedIssue.subscribe(function() {
		if (self.selectedIssue() != null && self.selectedIssue().name != null) {
			self.isLoading(true);
			org.OpenGeoPortal.browseTableObj.getTableObj().fnClearTable();
			self.selectedIssue().init(self);
		}
	});
//	self.refreshExtent = ko.observable(false);
//	self.currentMapExtent = ko.computed(function() {
//		console.log("refreshing map extent");
//		self.refreshExtent(!self.refreshExtent());
//		return org.OpenGeoPortal.map.getExtent();
//	});
//	self.newExtent = ko.observable(self.currentMapExtent());
//	self.setMapExtent = function() {
//		self.refreshExtent(!self.refreshExtent());
//		var nn = self.newExtent() instanceof OpenLayers.Bounds ? self.newExtent() : self.newExtent().split(",");
//		var ne = org.OpenGeoPortal.map.boundsArrayToOLObject(nn);
//		console.log("setting map extent to " + ne);
//		org.OpenGeoPortal.map.zoomToExtent(ne, true);
//	};
};

org.fgdl.EtdmIssue = function(js) {
	var self = this;
	self.name = js.name;

	self.datasets = ko.observableArray();

	self.isInited = ko.observable(false);

	self.init = function (layerBrowser) {
		if (self.isInited()) return;
		self.isInited(true);
		// load datasets from server
		//Dataset._path = "http://gp/est/dwr";

		Dataset.byIssue(function(reply) {
			ko.utils.arrayForEach(reply, function (dataset) {
				//console.log(dataset.layerAccess);
				if (dataset.layerAccess == "public")
					self.datasets.push(new org.fgdl.Dataset(dataset));
			});
			org.OpenGeoPortal.browseTableObj.searchRequest(0);
			layerBrowser.isLoading(false);
		}, js);
	};

	self.showDatasets = ko.observable(false);
};

org.fgdl.Dataset = function(js) {
	var self = this;
	self.id = js.id;
	self.name = js.fgdlLayerName;
	self.link = js.metadataPath;
};