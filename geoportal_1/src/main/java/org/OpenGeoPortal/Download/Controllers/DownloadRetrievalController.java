package org.OpenGeoPortal.Download.Controllers;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

import javax.servlet.http.HttpServletResponse;

import org.OpenGeoPortal.Download.DownloadRequest;
import org.OpenGeoPortal.Download.RequestStatusManager;
import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequestMapping("/getDownload")
public class DownloadRetrievalController {
	@Autowired
	private RequestStatusManager requestStatusManager;
	final Logger logger = LoggerFactory.getLogger(this.getClass());
	final static long TIMEOUT = 5000;//milliseconds
	final static long INTERVAL = 500;//milliseconds
	
	@RequestMapping(method=RequestMethod.GET)
	public void getDownload(@RequestParam("requestId") String requestId, HttpServletResponse response) throws IOException, InterruptedException  {
		
		DownloadRequest layerDownloadRequest = requestStatusManager.getDownloadRequest(UUID.fromString(requestId));
		File downloadPackage = layerDownloadRequest.getDownloadPackage();
		long counter = 0;
		//a final check.  should never get here via the client
		while (!downloadPackage.exists()){
			Thread.sleep(INTERVAL);
			counter += INTERVAL;
			if (counter >= TIMEOUT){
				logger.error("Download timed out.  File could not be found.");
				throw new IOException("File does not exist.");
			}
		}
		logger.info("Milliseconds slept: " + Long.toString(counter));
		response.setContentLength((int) downloadPackage.length());
		response.setContentType("application/zip");
		response.addHeader("Content-Disposition", "attachment;filename=" + downloadPackage.getName());
		FileUtils.copyFile(downloadPackage, response.getOutputStream());
	}
}
