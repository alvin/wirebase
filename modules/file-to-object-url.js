import loadImage from 'blueimp-load-image/js/load-image';
require('blueimp-load-image/js/load-image-exif');
require('blueimp-load-image/js/load-image-meta');
require('blueimp-load-image/js/load-image-orientation');

export default async (file, path, inputImageOpts = {}) => {

  var uploadBlobs = uploadBlobs || {};
  
  return new Promise((resolve, reject) => {
      if (!file.type.match('image') || file.type.match('svg') || file.type.match('png') || file.type.match('gif')) {
        // read non-image file 
        var reader  = new FileReader();

        reader.addEventListener("load", () => {
          //console.log(reader.result);
        
          var blob = new Blob([reader.result]);
                    
          resolve({
            name: file.name, 
            blob: blob, 
            url: window.URL.createObjectURL(blob) 
          });
          
        }, false);

        reader.readAsArrayBuffer(file);
        
      } else {
        var defaultImageOpts = {
          canvas: true,
          maxWidth: 1920,
          maxHeight: 1920                 
        };
        
        const imageOpts = Object.assign(defaultImageOpts, inputImageOpts);
        console.log(`Image Opts for ${path}`, imageOpts)
        
        loadImage.parseMetaData(file, function (data) {
          if (data.exif) {
            imageOpts.orientation = data.exif.get('Orientation')
          }
        });
        
        loadImage(file, 
          (canvas) => {
            canvas.toBlob((blob) => {
              console.log(blob);
              
              resolve({
                name: file.name, 
                blob: blob, 
                url: window.URL.createObjectURL(blob),
                image: true                
              });
          
            },
            'image/jpeg', 0.7);
          },
          imageOpts
        );
        
      }
      
  })
  .then((uploadData) => {
    console.log('made object url', uploadData)
    return(uploadData)
  })

}


