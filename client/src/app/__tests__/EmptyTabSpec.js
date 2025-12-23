/**
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information regarding copyright
 * ownership.
 *
 * Camunda licenses this file to you under the MIT; you may not use this file
 * except in compliance with the MIT License.
 */

import React from 'react';

import { render } from '@testing-library/react';

import EmptyTab from '../EmptyTab';
import TabsProvider from '../TabsProvider';

import Flags, { DISABLE_DMN, DISABLE_FORM, DISABLE_PLATFORM } from '../../util/Flags';

/* global sinon */

describe('<EmptyTab>', function() {

  describe('dispatching action', function() {

    it('should dispatch create-* actions', function() {

      // given
      const onAction = sinon.spy();

      const { getAllByRole } = createEmptyTab({ onAction });

      const buttons = getAllByRole('button');

      // when
      buttons.forEach(btn => btn.click());

      // then
      expect(onAction).to.have.callCount(3);
      expect(onAction.args).to.eql([
        [ 'create-bpmn-diagram', undefined ],
        [ 'create-dmn-diagram', undefined ],
        [ 'create-form', undefined ]
      ]);
    });

  });


  describe('disabling dmn', function() {

    afterEach(sinon.restore);

    it('should NOT display dmn diagram on flag', function() {

      // given
      sinon.stub(Flags, 'get').withArgs(DISABLE_DMN).returns(true);

      // when
      const { queryAllByText } = createEmptyTab();

      // then
      expect(queryAllByText('DMN diagram')).to.be.empty;
    });


    it('should display dmn diagram without flag', function() {

      // given
      const { queryAllByText } = createEmptyTab();

      // then
      expect(queryAllByText('DMN diagram')).to.have.length(1);
    });
  });


  describe('disabling form', function() {

    afterEach(sinon.restore);

    it('should NOT display form on flag', function() {

      // given
      sinon.stub(Flags, 'get').withArgs(DISABLE_FORM).returns(true);

      // when
      const { queryAllByText } = createEmptyTab();

      // then
      expect(queryAllByText('Form')).to.be.empty;
    });


    it('should display form without flag', function() {

      // given
      const { queryAllByText } = createEmptyTab();

      // then
      expect(queryAllByText('Form')).to.have.length(1);
    });

  });


  describe('enable platform', function() {

    afterEach(sinon.restore);

    it('should display platform without flag', function() {

      // when
      const { queryByTestId } = createEmptyTab();

      // then
      expect(queryByTestId('welcome-page-platform')).to.exist;
    });


    it('should NOT display platform with flag', function() {

      // given
      sinon.stub(Flags, 'get').withArgs(DISABLE_PLATFORM).returns(true);

      // given
      const { queryByTestId } = createEmptyTab();

      // then
      expect(queryByTestId('welcome-page-platform')).to.not.exist;
    });

  });

  function createEmptyTab(options = {}) {
    const tabsProvider = new TabsProvider();

    return render(
      <EmptyTab
        onAction={ options.onAction || sinon.fake() }
        onShown={ options.onShown || sinon.fake() }
        tabsProvider={ tabsProvider }
      />
    );
  }
});
