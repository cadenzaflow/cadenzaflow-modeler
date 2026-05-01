/**
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information regarding copyright
 * ownership.
 *
 * Camunda licenses this file to you under the MIT; you may not use this file
 * except in compliance with the MIT License.
 */

export const ENGINES = {
  PLATFORM: 'CadenzaFlow'
};

export const ENGINE_PROFILES = [
  {
    executionPlatform: ENGINES.PLATFORM,
    executionPlatformVersions: [ '1.1.0', '1.0.0' ],
    latestStable: '1.1.0'
  }
];

export const ENGINE_LABELS = {
  [ENGINES.PLATFORM]: 'CadenzaFlow'
};

export function getLatestStable(platform) {
  const profile = ENGINE_PROFILES.find(
    p => p.executionPlatform === platform
  );

  if (!profile) {
    throw new Error(`no profile for platform <${platform}>`);
  }

  return profile.latestStable;
}
