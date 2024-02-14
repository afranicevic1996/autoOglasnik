import Listing from "./Listing";

const ListingContainer = ({ listings, userInfo, handleModalOpen, withEdit, withDelete, headerText }) => {

  return (
    <div className="listings-box">
      <div className="listings-header">
        {headerText}
      </div>

      <div className="listings-body">
        {listings.map((listing, i) => {
          return (
            <Listing key={i} handleModalOpen={handleModalOpen} userInfo={userInfo} listing={listing} withEdit={withEdit} withDelete={withDelete} />
          )
        })}
      </div>

    </div>
  )
}

export default ListingContainer