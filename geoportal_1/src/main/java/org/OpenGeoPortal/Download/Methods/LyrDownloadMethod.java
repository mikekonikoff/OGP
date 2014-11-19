/**
 *
 */
package org.OpenGeoPortal.Download.Methods;

import java.net.MalformedURLException;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.OpenGeoPortal.Download.Types.LayerRequest;
import org.OpenGeoPortal.Utilities.Http.HttpRequester;
import org.codehaus.jackson.JsonParseException;

/**
 * @author Michael_Konikoff
 *
 */
public class LyrDownloadMethod extends AbstractDownloadMethod implements PerLayerDownloadMethod {
	private static final Boolean INCLUDES_METADATA = true;
	private static final String METHOD = "GET";

	@Override
	public Boolean includesMetadata() {
		return INCLUDES_METADATA;
	}

	@Override
	public String getMethod(){
		return METHOD;
	}

	@Override
	public Set<String> getExpectedContentType(){
		Set<String> expectedContentType = new HashSet<String>();
		expectedContentType.add("application/octet-stream");
		return expectedContentType;
	}

	@Override
	public Boolean expectedContentTypeMatched(String foundContentType){
		//a file download could be anything
		return true;
	}

	@Override
	public String createDownloadRequest() throws Exception {
		return "";
	}

	@Override
	public List<String> getUrls(LayerRequest layer) throws MalformedURLException, JsonParseException {
		return Arrays.asList("http://geoportal04.est.geoplan.ufl.edu/layer_files/" + layer.getLayerInfo().getName().toLowerCase() + ".lyr");
	}
}
