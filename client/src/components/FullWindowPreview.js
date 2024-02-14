import "../css/FullWindowPreview.css";

const FullWindowPreview = ({ setFullWindowPreview, currentImage, moveBigPicture, imgsHTML }) => {

  return(
    <div className="preview-box">
      <div className="preview-box-header">
        <span className="close-x" onClick={() => setFullWindowPreview(false)}>X</span>
      </div>

      <div className="preview-main">

        <div className="direction-arrows" onClick={() => moveBigPicture(currentImage?.id - 1)} >
          &lt;
        </div>

        <img src={currentImage.src} />

        <div className="direction-arrows" onClick={() => moveBigPicture(currentImage?.id + 1)} >
          &gt;
        </div>
        
      </div>

      <div className="small-pictures on-bottom">
        {imgsHTML}
      </div>
    </div>
    
  )
}

export default FullWindowPreview