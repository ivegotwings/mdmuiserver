window.LiquidResponseHelper = window.LiquidResponseHelper || {};

LiquidResponseHelper.downloadURLResponseMapper=function(e, mapperFunc) {
        if (
            !e || 
            !e.detail || 
            !e.detail.response || 
            !e.detail.response.response
        ) return;
    
        const response = e.detail.response.response;

        const binaryStreamObjects = response.status.toLowerCase() == "success"
            && response.binaryStreamObjects;
        if (!binaryStreamObjects) return;

        binaryStreamObjects.forEach(obj => {
            if(!obj.data) return;

            const downloadURL = obj.data.properties.downloadURL;
            const objectKey = obj.data.properties.objectKey;
            if(!downloadURL) return;

            mapperFunc(downloadURL, objectKey);
        });                    
    };
