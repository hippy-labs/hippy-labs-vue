import {Router} from 'vue-router';
import {createHippyRouter} from '@hippy/vue-router-next-history';

const routes = [];

/**
 * create HippyRouter instance
 */
export function createRouter(): Router {
  return createHippyRouter({
    routes,
  });
}
