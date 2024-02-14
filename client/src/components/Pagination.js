import "../css/Pagination.css";


const Pagination = ({pagination, setPagination, handleChange}) => {

  var pageLinks = [];
  for(var i = 1; i <= pagination.maxPages; i++){
    if(i === parseInt(pagination.page)){
      pageLinks.push(<div id={i} key={i} onClick={(e) => handleChange(e)} className="pagination-button active">{i}</div>);
      continue;
    }

    pageLinks.push(<div id={i} key={i} onClick={(e) => handleChange(e)} className="pagination-button">{i}</div>);
  }

  return(
    <div className="pagination-box">
      
      {pageLinks}

    </div>
  )
}

export default Pagination