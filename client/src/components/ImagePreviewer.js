import { useEffect, useState } from "react";
import "../css/ImagePreviewer.css";
import FullWindowPreview from "./FullWindowPreview";

const ImagePreviewer = ({ data, width = {}, withDelete = {status: false}, onDelete, handleModalOpen }) => {
  const [images, setImages] = useState(data);
  const [currentImage, setCurrentImage] = useState();
  const [imgsHTML, setImgsHTML] = useState();
  const [fullWindowPreview, setFullWindowPreview] = useState(false); 
  const [counter, setCounter] = useState(0);

  const handleChange = (e) => {
    var checkboxName = e.target.name;
    var filesToDeleteCopy = images;
    filesToDeleteCopy.forEach((image, index) => {
      if(image.src === checkboxName)
        filesToDeleteCopy[index].delete = !filesToDeleteCopy[index].delete;
    });

    setCounter((prev) => prev + 1);
    setImages(filesToDeleteCopy);
  }

  const getImagesHTML = () => {
    var imgHTML = [];

    var currentImageHTMLClass;
    images.forEach((image) => {
      currentImageHTMLClass = "image-s";

      if(image.current){
        currentImageHTMLClass = "image-s active";
        setCurrentImage(image);
      }


      if(withDelete.status){
        imgHTML.push(
          <div key={image.id} className={currentImageHTMLClass}> 
            <img alt="" id={image.id} onClick={(e) => handleImageChange(e)} src={image.src} />
            <div style={{textAlign: "center"}}>
              <input type="checkbox" checked={image.delete} name={image.src} onChange={(e) => handleChange(e)}/>
            </div>
          </div>
        );
      }
      else{
        imgHTML.push(
          <div key={image.id} className={currentImageHTMLClass}>
            <img alt=""  id={image.id} onClick={(e) => handleImageChange(e)} src={image.src} />
          </div>
        );
      }

      setImgsHTML(imgHTML);
    });
  
  }

  const handleImageChange = (e) => {
    var newImages = [];
    images.forEach((image) => {
      if(image.id === parseInt(e.target.id)){
        scrollToActive(image.id);
        newImages.push({id: image.id, delete: image.delete, current: true, src: image.src});
        return;
      }

      newImages.push({id: image.id, delete: image.delete, current: false, src: image.src});
    });
    
    setImages(newImages);
  }

  const moveBigPicture = (imageID) => {
    if(imageID === undefined || imageID < 0 || imageID > (images.length - 1))
      return;

    var imagesCopy = [];
    images.forEach((image) => {
      if(image.id === imageID){
        scrollToActive(image.id);
        imagesCopy.push({id: image.id, delete: image.delete, current: true, src: image.src});
        return;
      }

      imagesCopy.push({id: image.id, delete: image.delete, current: false, src: image.src});
    });

    setImages(imagesCopy);
  }

  const scrollToActive = (activeID) => {
    document.getElementById(activeID).scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });

    /*
    setTimeout(function () {
      scrollToBottom();
    }, 200);
    return;
    */
  }

  useEffect(() => {getImagesHTML()}, [images, counter]);
  useEffect(() => {setImages(data)}, [data]);

/*
<div className="preview-header">
  Image Preview
</div>
*/

  return(
    <>
      {fullWindowPreview &&
        <FullWindowPreview setFullWindowPreview={setFullWindowPreview} currentImage={currentImage} moveBigPicture={moveBigPicture} imgsHTML={imgsHTML} />
      }

      {currentImage &&

        <div id="box" className="preview-container" style={width}>

          <div className="main-picture">

            <div className="direction-arrows" onClick={() => moveBigPicture(currentImage?.id - 1)} >
              &lt;
            </div>

            <img alt="" onClick={() => {setFullWindowPreview(true)}} src={currentImage.src}/>

            <div className="direction-arrows" onClick={() => moveBigPicture(currentImage?.id + 1)} >
              &gt;
            </div>
            
          </div>

          <div className="small-pictures">
            {imgsHTML}
          </div>

          {withDelete.status && 
            <div className="delete-buttons">
              <button id="selected" className="listing-button" onClick={(e) => {handleModalOpen(e, "Want to delete selected images ?", false, onDelete, images)}}>Delete selected</button>
              <button id="all" className="listing-button" onClick={(e) => {handleModalOpen(e, "Want to delete all images ?", false, onDelete, images)}}>Delete all</button>
            </div>
          }
        </div>
      
      }
    </>
  )
}

export default ImagePreviewer