import { Injectable } from '@angular/core';
import { LuigiIntent, LuigiNode } from '../../models/luigi';

@Injectable({
  providedIn: 'root',
})
export class IntentNavigationService {
  constructor() {}

  /**
   * This function builds the Luigi based intent mapping configuration from the pre-built intent target knowledge
   * It iterates existing intentMappings and constructs pathSegment from the relative path of the defined entity and the target
   * that uses the entity as a reference
   *
   * @param nodes the nodes to fetch intentMapping initial configuration from
   * @returns a list of luigi intent objects
   */
  buildIntentMappings(nodes: LuigiNode[]): LuigiIntent[] {
    let intentMappings: LuigiIntent[] = [];
    let entityRelativePaths: Record<string, any> = {};
    // find mapping on config from node[0] --> not 0 anymore need to traverse fully
    for (const item of nodes) {
      if (item._intentMappings) {
        intentMappings = [...intentMappings, ...item._intentMappings];
      }
      if (item._entityRelativePaths) {
        entityRelativePaths = {
          ...entityRelativePaths,
          ...item._entityRelativePaths,
        };
      }
    }

    for (const intentElement of intentMappings) {
      if (entityRelativePaths && intentElement.baseEntityId) {
        let entityPath = '';
        intentElement.baseEntityId.split('.').forEach((entity) => {
          if (
            entityRelativePaths[entity] &&
            entityRelativePaths[entity].pathSegment
          ) {
            entityPath += '/' + entityRelativePaths[entity].pathSegment;
          }
        });
        intentElement.pathSegment = this.removeDuplicateSlash(
          entityPath + '/' + intentElement.relativePath
        );
      }
    }
    return intentMappings;
  }

  /**
   * Removes duplicate slashes if exist
   *
   * @param url the url string to modify
   * @returns
   */
  removeDuplicateSlash(url: string) {
    return url.replace(/\/+/g, '/');
  }
}
