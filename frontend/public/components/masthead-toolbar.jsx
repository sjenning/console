import * as React from 'react';
import * as _ from 'lodash-es';
import { connect } from 'react-redux';
import { ArrowCircleUpIcon, QuestionCircleIcon, ThIcon } from '@patternfly/react-icons';
import { Button, Dropdown, DropdownToggle, DropdownSeparator, DropdownItem, KebabToggle, Toolbar, ToolbarGroup, ToolbarItem } from '@patternfly/react-core';

import { FLAGS, stateToProps as flagStateToProps, flagPending } from '../features';
import { authSvc } from '../module/auth';
import { history } from './utils';
import { openshiftHelpBase } from './utils/documentation';
import { AboutModal } from './about-modal';

class MastheadToolbar_ extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isApplicationLauncherDropdownOpen: false,
      isUserDropdownOpen: false,
      isKebabDropdownOpen: false,
      username: null,
      showAboutModal: false,
    };

    this._updateUser = this._updateUser.bind(this);
    this._onUserDropdownToggle = this._onUserDropdownToggle.bind(this);
    this._onUserDropdownSelect = this._onUserDropdownSelect.bind(this);
    this._onKebabDropdownToggle = this._onKebabDropdownToggle.bind(this);
    this._onKebabDropdownSelect = this._onKebabDropdownSelect.bind(this);
    this._renderMenuItems = this._renderMenuItems.bind(this);
    this._renderMenu = this._renderMenu.bind(this);
    this._onClusterUpdatesAvailable = this._onClusterUpdatesAvailable.bind(this);
    this._onApplicationLauncherDropdownSelect = this._onApplicationLauncherDropdownSelect.bind(this);
    this._onApplicationLauncherDropdownToggle = this._onApplicationLauncherDropdownToggle.bind(this);
    this._onHelpDropdownSelect = this._onHelpDropdownSelect.bind(this);
    this._onHelpDropdownToggle = this._onHelpDropdownToggle.bind(this);
    this._onAboutModal = this._onAboutModal.bind(this);
    this._closeAboutModal = this._closeAboutModal.bind(this);
  }

  componentDidMount() {
    this._updateUser();
  }

  componentDidUpdate(prevProps) {
    if (this.props.flags[FLAGS.OPENSHIFT] !== prevProps.flags[FLAGS.OPENSHIFT]
      || !_.isEqual(this.props.user, prevProps.user)) {
      this._updateUser();
    }
  }

  _updateUser() {
    const { flags, user } = this.props;
    if (!flags[FLAGS.OPENSHIFT]) {
      this.setState({ username: authSvc.name() });
    }
    this.setState({ username: _.get(user, 'fullName') || _.get(user, 'metadata.name', '') });
  }

  _onUserDropdownToggle(isUserDropdownOpen) {
    this.setState({
      isUserDropdownOpen,
    });
  }

  _onUserDropdownSelect() {
    this.setState({
      isUserDropdownOpen: !this.state.isUserDropdownOpen,
    });
  }

  _onKebabDropdownToggle(isKebabDropdownOpen) {
    this.setState({
      isKebabDropdownOpen,
    });
  }

  _onKebabDropdownSelect() {
    this.setState({
      isKebabDropdownOpen: !this.state.isKebabDropdownOpen,
    });
  }

  _onClusterUpdatesAvailable() {
    history.push('/settings/cluster');
  }

  _onApplicationLauncherDropdownSelect() {
    this.setState({
      isApplicationLauncherDropdownOpen: !this.state.isApplicationLauncherDropdownOpen,
    });
  }

  _onApplicationLauncherDropdownToggle(isApplicationLauncherDropdownOpen) {
    this.setState({
      isApplicationLauncherDropdownOpen,
    });
  }

  _onHelpDropdownSelect() {
    this.setState({
      isHelpDropdownOpen: !this.state.isHelpDropdownOpen,
    });
  }

  _onHelpDropdownToggle(isHelpDropdownOpen) {
    this.setState({
      isHelpDropdownOpen,
    });
  }

  _onClusterManager(e) {
    e.preventDefault();
    window.open('https://cloud.openshift.com', '_blank').opener = null;
  }

  _onAboutModal(e) {
    e.preventDefault();
    this.setState({ showAboutModal: true });
  }

  _closeAboutModal() {
    this.setState({ showAboutModal: false });
  }

  _onDocumentation(e) {
    e.preventDefault();
    window.open(openshiftHelpBase, '_blank').opener = null;
  }

  _renderMenuItems(actions) {
    return actions.map((action, i) => action.separator
      ? <DropdownSeparator key={i} />
      : <DropdownItem key={i} onClick={action.callback}>{action.label}</DropdownItem>
    );
  }

  _renderMenu(mobile) {
    const { flags } = this.props;
    const { isUserDropdownOpen, isKebabDropdownOpen, username } = this.state;

    if (flagPending(flags[FLAGS.OPENSHIFT]) || flagPending(flags[FLAGS.AUTH_ENABLED]) || !username) {
      return null;
    }

    const actions = [];
    if (flags[FLAGS.AUTH_ENABLED]) {
      const logout = e => {
        e.preventDefault();
        if (flags[FLAGS.OPENSHIFT]) {
          authSvc.deleteOpenShiftToken().then(() => authSvc.logout());
        } else {
          authSvc.logout();
        }
      };

      if (mobile) {
        actions.push({
          separator: true,
        });
      }

      actions.push({
        label: 'Log out',
        callback: logout,
      });
    }

    if (mobile) {
      actions.unshift({
        label: 'Documentation',
        callback: this._onDocumentation,
      },{
        label: 'About',
        callback: this._onAboutModal,
      });

      if (flags[FLAGS.OPENSHIFT]) {
        actions.unshift({
          label: 'Cluster Manager',
          callback: this._onClusterManager,
        },{
          separator: true,
        });
      }

      return (
        <Dropdown
          isPlain
          position="right"
          onSelect={this._onKebabDropdownSelect}
          toggle={<KebabToggle onToggle={this._onKebabDropdownToggle} />}
          isOpen={isKebabDropdownOpen}
          dropdownItems={this._renderMenuItems(actions)}
        />
      );
    }

    if (_.isEmpty(actions)) {
      return <div className="co-username">{username}</div>;
    }

    return (
      <Dropdown
        isPlain
        position="right"
        onSelect={this._onUserDropdownSelect}
        isOpen={isUserDropdownOpen}
        toggle={<DropdownToggle onToggle={this._onUserDropdownToggle}>{username}</DropdownToggle>}
        dropdownItems={this._renderMenuItems(actions)}
      />
    );
  }

  render() {
    const { isApplicationLauncherDropdownOpen, isHelpDropdownOpen, showAboutModal } = this.state;
    const { flags } = this.props;
    return (
      <React.Fragment>
        <Toolbar>
          <ToolbarGroup className="pf-u-sr-only pf-u-visible-on-md">
            {/* desktop -- (updates button) */}
            {flags[FLAGS.CLUSTER_UPDATES_AVAILABLE] && <ToolbarItem>
              <Button variant="plain" aria-label="Cluster Updates Available" onClick={this._onClusterUpdatesAvailable}>
                <ArrowCircleUpIcon />
              </Button>
            </ToolbarItem>}
            {/* desktop -- (application launcher dropdown), help dropdown [documentation, about] */}
            {flags[FLAGS.OPENSHIFT] && <ToolbarItem>
              <Dropdown
                isPlain
                onSelect={this._onApplicationLauncherDropdownSelect}
                toggle={
                  <DropdownToggle aria-label="Application Launcher" iconComponent={null} onToggle={this._onApplicationLauncherDropdownToggle}>
                    <ThIcon />
                  </DropdownToggle>
                }
                isOpen={isApplicationLauncherDropdownOpen}
                dropdownItems={[
                  <DropdownItem key="clustermanager" onClick={this._onClusterManager}>
                    Cluster Manager
                  </DropdownItem>,
                ]}
              />
            </ToolbarItem>}
            <ToolbarItem>
              <Dropdown
                isPlain
                onSelect={this._onHelpDropdownSelect}
                toggle={
                  <DropdownToggle aria-label="Help" iconComponent={null} onToggle={this._onHelpDropdownToggle}>
                    <QuestionCircleIcon />
                  </DropdownToggle>
                }
                isOpen={isHelpDropdownOpen}
                dropdownItems={[
                  <DropdownItem key="documentation" onClick={this._onDocumentation}>
                    Documentation
                  </DropdownItem>,
                  <DropdownItem key="about" onClick={this._onAboutModal}>
                    About
                  </DropdownItem>,
                ]}
              />
            </ToolbarItem>
          </ToolbarGroup>
          <ToolbarGroup >
            {/* mobile -- kebab dropdown [(cluster manager |) documentation, about (| logout)] */}
            <ToolbarItem className="pf-u-hidden-on-md pf-u-mr-0">{this._renderMenu(true)}</ToolbarItem>
            {/* desktop -- (user dropdown [logout]) */}
            <ToolbarItem className="pf-u-sr-only pf-u-visible-on-md">{this._renderMenu(false)}</ToolbarItem>
          </ToolbarGroup>
        </Toolbar>
        {showAboutModal && <AboutModal isOpen={showAboutModal} closeAboutModal={this._closeAboutModal} />}
      </React.Fragment>
    );
  }
}

const mastheadToolbarStateToProps = state => {
  const desiredFlags = [FLAGS.AUTH_ENABLED, FLAGS.OPENSHIFT, FLAGS.CLUSTER_UPDATES_AVAILABLE];
  const flagProps = flagStateToProps(desiredFlags, state);
  const user = state.UI.get('user');
  return { ...flagProps, user };
};

export const MastheadToolbar = connect(mastheadToolbarStateToProps)(MastheadToolbar_);
