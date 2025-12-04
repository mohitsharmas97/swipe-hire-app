package com.job.demo.controller;

import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class FileServingController {

    // Helper to determine content type
    private MediaType getMediaTypeForFileName(String fileName) {
        if (fileName.endsWith(".pdf")) return MediaType.APPLICATION_PDF;
        if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) return MediaType.IMAGE_JPEG;
        if (fileName.endsWith(".png")) return MediaType.IMAGE_PNG;
        return MediaType.APPLICATION_OCTET_STREAM; // default
    }

    @GetMapping("/uploads/{folder}/{filename:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String folder, @PathVariable String filename) {
        try {
            // 1. Build the path to the file
            // System.getProperty("user.dir") ensures we look in the project root/uploads
            Path filePath = Paths.get(System.getProperty("user.dir"), "uploads", folder, filename);
            Resource resource = new UrlResource(filePath.toUri());

            // 2. Check if file exists
            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                        .contentType(getMediaTypeForFileName(filename))
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}