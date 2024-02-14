import "../css/Listing.css";
import { useNavigate, Link } from "react-router-dom";

const Listing = (props) => {
  const navigate = useNavigate();
  var listing = props.listing;
  var user = props.userInfo;

  var listingHtml = "delete-" + listing.id;
  var userLink = "/profile/" + listing.userID;
  var listingLink = "/listing/" + listing.id;
  var editListingLink = "/editListing/" + listing.id;
  var imgSrc = listing.files;
  imgSrc = imgSrc.split(",");
  imgSrc = "/images/" + imgSrc[0];

  var price = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(listing.price);
  var mileage = new Intl.NumberFormat('de-DE', { maximumSignificantDigits: 3 }).format(listing.mileage);

  return (
    <>
      <div className="listing-container">

        <div className="listing-left-side">
          <div className="image-container">
            <img src={imgSrc} />
          </div>
        </div>

        <div className="listing-center">

          <div className="data-wrapper">
            <a href={listingLink} >{listing.name}</a> <br />
            Type: Used<br />
            Mileage: {mileage} km<br />
            Production year: {listing.productionYear}<br />
            {user
            ?
              <span>Location: {user.address}, {user.countyName}</span>
            :
              <span>Location: {listing.address}, {listing.countyName}</span>
            }
          </div>
          
          
          <div className="listing-actions-container">
            {props.withEdit.status && 
              <Link to={editListingLink}><button className="listing-button">Edit</button></Link>
            }

            {props.withDelete.status && 
              <button id={listingHtml} className="listing-button" onClick={(e) => props.handleModalOpen(e, "Want to delete this listing ?", false, props.withDelete.onDelete)}>Delete</button>
            }
          </div>
          




        </div>

        <div className="listing-right-side">
          <div className="right-wrapper">
            {price}
          </div>
          
        </div>

      </div>
    </>
  )
}

export default Listing