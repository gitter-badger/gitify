import React from 'react';

const shell = window.require('electron').shell;

var Actions = require('../actions/actions');
var apiRequests = require('../utils/api-requests');
var SettingsStore = require('../stores/settings');

var NotificationItem = React.createClass({

  getInitialState: function () {
    return {
      isRead: this.props.isRead
    };
  },

  componentWillReceiveProps: function (nextProps) {
    this.setState({
      isRead: nextProps.isRead
    });
  },

  pressTitle: function () {
    var markOnClick = SettingsStore.getSettings().markOnClick;
    this.openBrowser();

    if (markOnClick) {
      this.markAsRead();
    }
  },

  openBrowser: function () {
    var url = this.props.notification.subject.url.replace('api.github.com/repos', 'www.github.com');
    if (url.indexOf('/pulls/') != -1) {
      url = url.replace('/pulls/', '/pull/');
    }
    shell.openExternal(url);
  },

  markAsRead: function () {
    var self = this;

    if (this.state.read) { return; }

    apiRequests
      .patchAuth('https://api.github.com/notifications/threads/' + this.props.notification.id)
      .end(function (err, response) {
        if (response && response.ok) {
          // Notification Read
          self.setState({
            isRead: true
          });
          Actions.removeNotification(self.props.notification);
        } else {
          // Error - Show messages.
          // Show appropriate message
          self.setState({
            isRead: false
          });
        }
      });
  },

  render: function () {
    var typeIconClass, typeIconTooltip;

    if (this.props.notification.subject.type == 'Issue') {
      typeIconClass = 'octicon octicon-issue-opened';
      typeIconTooltip = 'Issue';
    } else if (this.props.notification.subject.type == 'PullRequest') {
      typeIconClass = 'octicon octicon-git-pull-request';
      typeIconTooltip = 'Pull Request';
    } else if (this.props.notification.subject.type == 'Commit') {
      typeIconClass = 'octicon octicon-git-commit';
      typeIconTooltip = 'Commit';
    } else {
      typeIconClass = 'octicon octicon-question';
      typeIconTooltip = '';
    }

    return (
      <div className={this.state.isRead ? 'row notification read' : 'row notification'}>
        <div className='col-xs-1'><span title={typeIconTooltip} className={typeIconClass} /></div>
        <div className='col-xs-10 subject' onClick={this.pressTitle}>
          {this.props.notification.subject.title}
        </div>
        <div className='col-xs-1 check-wrapper'>
          <span title="Mark as Read" className='octicon octicon-check' onClick={this.markAsRead} />
        </div>
      </div>
    );
  }
});

module.exports = NotificationItem;
