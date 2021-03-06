import React from "react";

class SearchDashboard extends React.Component {
  render() {
    return (
      <div className="top-navigation-search">
        <form className="form-inline form-custom">
          {/*<i className="material-icons">search</i>*/}
          <div className="sb-form-groupbmd-form-group">
            <label className="dashboard-search-label">Search</label>
            <input
              type="text"
              className="_input-"
              id="top-navigation-search-input"
            />
          </div>
        </form>
        <button className="buttons btn-white color-default btn-raised m-b-0 m-l-15">
          Explore
        </button>
      </div>
    );
  }
}

export default SearchDashboard;
