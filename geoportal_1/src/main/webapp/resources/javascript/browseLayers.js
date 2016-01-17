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
	self.publishers = ko.observableArray();
	self.selectedPublisher = ko.observable(null);

	self.isInited = ko.observable(false);

	self.init = function () {
		if (self.isInited()) return;
		self.isInited(true);
		// load issues from server
		//Issue._path = "http://gp/est/dwr";
		//jQuery.blockUI({message: "<br /><img src='/est/images/load.gif' />Loading...<br /><br />"});
		Issue.listEtatIssues(function(reply) {
			//jQuery.unblockUI();
			var etatIssues = [];
			for (var i = 0; i < reply.length; i++) {
				etatIssues.push(new org.fgdl.EtdmIssue(reply[i]));
			}
			self.issues(etatIssues);
		});


		var solr = new org.OpenGeoPortal.Solr();
		solr.setSort("PublisherSort", solr.SortAcending);
		var query = solr.getTermsQuery(["PublisherSort"], "");
		var facetSuccess = function(data){
			var labelArr = [], labelSet = [];
			jQuery.each(["PublisherSort"], function(idx, val) {
				var dataArr = data.terms[val];
				for (var i in dataArr){
					if (i%2 != 0){
						continue;
					}
					var label = dataArr[i].toUpperCase().trim();
					if (labelSet.indexOf(label) > -1){
						continue;
					}
					var temp = {"label": label, "value":  label};
					labelArr.push(temp);
					labelSet.push(label);
					i++;
					i++;
				}
			});
			labelArr.sort(function(a,b) {
				// because setSort isn't working..
				if (a.value > b.value) return 1;
				if (a.value < b.value) return -1;
				return 0;
			});
			self.publishers(labelArr);
		};
		var facetError = function(){
			console.log("error loading publishers");
		};
		solr.termQuery(query, facetSuccess, facetError, this);

		org.OpenGeoPortal.browseTableObj.getTableObj().fnClearTable();
	};

	self.isLoading = ko.observable(false);

	self.selectedIssue = ko.observable(null);

	self.updateBrowseResults = function() {
		if ((self.selectedIssue() != null && self.selectedIssue().name != null) || (self.selectedPublisher() != null && self.selectedPublisher().value != null)){
			self.isLoading(true);
			org.OpenGeoPortal.browseTableObj.getTableObj().fnClearTable();
			org.OpenGeoPortal.browseTableObj.searchRequest(0);
		}
	};

	self.selectedIssue.subscribe(self.updateBrowseResults);

	self.selectedPublisher.subscribe(self.updateBrowseResults);

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
	self.id = js.id;

	self.datasets = ko.observableArray();

	self.isInited = ko.observable(false);

	self.init = function (layerBrowser) {
		if (self.isInited()) return;
		self.isInited(true);
		// load datasets from server
		//Dataset._path = "http://gp/est/dwr";

		Dataset.byIssue(function(reply) {
			var issueDatasets = [];
			ko.utils.arrayForEach(reply, function (dataset) {
				//console.log(dataset.layerAccess);
				if (dataset.layerAccess == "public")
					issueDatasets.push(new org.fgdl.Dataset(dataset));
			});
			self.datasets(issueDatasets);
			org.OpenGeoPortal.browseTableObj.searchRequest(0);
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