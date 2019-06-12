import React from "react";
import { browserHistory } from "react-router";
import cookie from "react-cookie";
import ReactCSSTransitionGroup from "react-addons-css-transition-group";
import _ from "lodash";
import { connect } from "react-redux";
import Load from "../utilities/load.jsx";
import { Authorizer, isAuthorized } from "../utilities/authorizer.jsx";
import Jumbotron from "../layouts/jumbotron.jsx";
import Content from "../layouts/content.jsx";
import DashboardWidget from "../elements/my-services/dashboard-widget.jsx";
import DashboardServiceList from "../elements/my-services/dashboard-service-list.jsx";
import Fetcher from "../utilities/fetcher.jsx";
import ModalInvoice from "../elements/modals/modal-invoice.jsx";
import { Price } from "../utilities/price.jsx";

class MyServices extends React.Component {
  constructor(props) {
    super(props);
    const uid = cookie.load("uid");
    const username = cookie.load("username");
    this.state = {
      services: [],
      url: `/api/v1/service-instances/own`,
      nextInvoice: false,
      invoiceUrl: `/api/v1/invoices/upcoming/${uid}`,
      uid,
      email: username,
      loading: true,
      invoiceModal: false,
    };
    this.handleComponentUpdating = this.handleComponentUpdating.bind(this);
    this.fetchServiceInstances = this.fetchServiceInstances.bind(this);
    this.fetchNextInvoice = this.fetchNextInvoice.bind(this);
    this.onOpenInvoiceModal = this.onOpenInvoiceModal.bind(this);
    this.onCloseInvoiceModal = this.onCloseInvoiceModal.bind(this);
  }

  componentDidMount() {
    if (!isAuthorized({})) {
      return browserHistory.push("/login");
    }
    this.fetchServiceInstances();
  }

  fetchServiceInstances() {
    const self = this;
    Fetcher(self.state.url).then(function(response) {
      if (response != null) {
        if (!response.error) {
          self.setState({ services: response });
          self.fetchNextInvoice();
        }
      }
      self.setState({ loading: false });
    });
  }

  fetchNextInvoice() {
    const self = this;
    Fetcher(self.state.invoiceUrl).then(function(response) {
      if (!response.error) {
        self.setState({ nextInvoice: response });
      }
      self.setState({ loading: false });
    });
  }

  handleComponentUpdating() {
    this.fetchServiceInstances();
  }

  onOpenInvoiceModal() {
    this.setState({ InvoiceModal: true });
  }

  onCloseInvoiceModal() {
    this.setState({ InvoiceModal: false });
  }

  render() {
    const self = this;
    const pageName = self.props.route.name;
    const breadcrumbs = [
      { name: "Home", link: "home" },
      { name: "My Account", link: null },
    ];

    if (self.state.loading) {
      return (
        <div>
          <Jumbotron pageName={pageName} location={this.props.location} />
          <div className="page-dashboard">
            <Content>
              <ReactCSSTransitionGroup
                component="div"
                transitionName="fade"
                transitionAppear
                transitionAppearTimeout={1000}
                transitionEnterTimeout={1000}
                transitionLeaveTimeout={1000}
              >
                <Load />
              </ReactCSSTransitionGroup>
            </Content>
          </div>
        </div>
      );
    }
    const allServices = self.state.services;
    const grouped = _.groupBy(allServices, "status");
    const runningServiceCount = grouped.running
      ? grouped.running.length
      : false;
    const requestedServiceCount = grouped.requested
      ? grouped.requested.length
      : false;
    const nextInvoiceAmountDue = self.state.nextInvoice
      ? self.state.nextInvoice.amount_due
      : 0;
    const userStatus = this.props.user.status;
    const widgetColor = () => {
      switch (self.props.user.status) {
        case "active":
          return "#27ae60";
        case "suspended":
          return "#ff0000"; // this will not happen because suspended user cannot login
        case "invited":
          return "#0069ff";
        case "flagged":
          return "#e67e22";
        case "disconnected":
          return "#95a5a6";
        default:
          return "#111111";
      }
    };

    const widgetIcon = () => {
      switch (self.props.user.status) {
        case "active":
          return "check";
        case "suspended":
          return "ban"; // this will not happen because suspended user cannot login
        case "invited":
          return "envelope";
        case "flagged":
          return "flag";
        case "disconnected":
          return "chain-broken";
        default:
          return "#111111";
      }
    };

    const currentModal = () => {
      if (self.state.InvoiceModal) {
        return (
          <ModalInvoice
            show={self.state.InvoiceModal}
            hide={self.onCloseInvoiceModal}
          />
        );
      }
    };

    return (
      <Authorizer>
        <Jumbotron pageName={pageName} location={this.props.location} />
        <div className="page-service-instance">
          <Content>
            <ReactCSSTransitionGroup
              component="div"
              transitionName="fade"
              transitionAppear
              transitionAppearTimeout={1000}
              transitionEnterTimeout={1000}
              transitionLeaveTimeout={1000}
            >
              <div className="row account-status-row">
                <DashboardWidget
                  widgetClass="col-xs-12 col-sm-6 col-md-4 col-lg-3 col-md-offset-2 col-lg-offset-3"
                  widgetIcon="credit-card"
                  widgetName="Upcoming Invoice"
                  clickAction={self.onOpenInvoiceModal}
                  iconPadding={10}
                  borderRadius={50}
                />
                <DashboardWidget
                  widgetClass="col-xs-12 col-sm-6 col-md-4 col-lg-3"
                  widgetIcon={widgetIcon()}
                  widgetName={`Status: ${userStatus}`}
                  widgetColor={widgetColor()}
                  iconPadding={10}
                  borderRadius={50}
                />
              </div>
              <div className="row">
                <DashboardServiceList
                  handleComponentUpdating={self.handleComponentUpdating}
                  services={self.state.services}
                />
              </div>
            </ReactCSSTransitionGroup>
          </Content>
          <ReactCSSTransitionGroup
            component="div"
            transitionName="fade"
            transitionAppear
            transitionEnter
            transitionLeave
            transitionAppearTimeout={1000}
            transitionEnterTimeout={1000}
            transitionLeaveTimeout={1000}
          >
            {currentModal()}
          </ReactCSSTransitionGroup>
        </div>
      </Authorizer>
    );
  }
}

export default connect(state => {
  return { user: state.user };
})(MyServices);
