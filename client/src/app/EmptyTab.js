/**
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information regarding copyright
 * ownership.
 *
 * Camunda licenses this file to you under the MIT; you may not use this file
 * except in compliance with the MIT License.
 */

import React, { PureComponent } from 'react';

import PlatformIcon from '../../resources/icons/Platform.svg';

import { utmTag } from '../util/utmTag';

import * as css from './EmptyTab.less';

import {
  Tab
} from './primitives';

import Flags, { DISABLE_PLATFORM } from '../util/Flags';


export default class EmptyTab extends PureComponent {

  componentDidMount() {
    this.props.onShown();
  }

  triggerAction() { }

  renderDiagramButton = (key, entry) => {
    const {
      onAction
    } = this.props;

    return (
      <button key={ key } className="btn btn-secondary" onClick={ () => onAction(entry.action, entry.options) }>
        {entry.icon && <entry.icon />}
        {entry.label}
      </button>
    );
  };

  /**
   * @param {string} group
   *
   * @return {React.JSX.Element[]}
   */
  getCreateButtons(group) {
    const providers = this.props.tabsProvider?.getProviders() || {};

    const tabs = Object.values(providers)
      .flatMap(tab => tab.getNewFileMenu && tab.getNewFileMenu().map(entry => ({ ...entry, icon: tab.getIcon() })))
      .filter(entry => entry?.group === group)
      .map((entry, index) => {
        return this.renderDiagramButton(index, entry);
      });

    return tabs;
  }

  renderPlatformColumn = () => {

    const createButtons = this.getCreateButtons('CadenzaFlow');

    return (
      <div id="welcome-page-platform" className="welcome-card" data-testid="welcome-page-platform">
        <div className="engine-info">
          <div className="engine-info-heading">
            <PlatformIcon className="engine-icon platform-icon" />
            <h3>CadenzaFlow</h3>
          </div>
          <a href={ utmTag('https://cadenzaflow.com/platform') }>See version details</a>
        </div>

        <p>Create a new file</p>

        {createButtons}
      </div>
    );
  };

  renderLearnMoreColumn = () => {

    return (
      <div id="welcome-page-learn-more" className="welcome-card">
        <div className="learn-more">
          <h3>Learn more</h3>
          <div className="article">
            <p>About Modeler</p>
            <a href="#" onClick={ () => this.props.onAction('emit-event', { type: 'versionInfo.open' }) }>Open &quot;What&apos;s new&quot;</a>
          </div>
          <div className="article">
            <p>Model your first diagram</p>
            <a href={ utmTag('https://docs.cadenzaflow.org/manual/latest/modeler/bpmn/') }>CadenzaFlow Modeler Docs</a>
          </div>
        </div>
      </div>
    );
  };

  render() {

    return (
      <Tab className={ css.EmptyTab }>
        <div className="welcome-cards">
          {!Flags.get(DISABLE_PLATFORM) && <>{this.renderPlatformColumn()}</>}
          {this.renderLearnMoreColumn()}
        </div>
      </Tab>
    );
  }
}

