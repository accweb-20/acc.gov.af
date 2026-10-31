// schemaTypes/index

import slider from './slider';
import annualReport from "./annualReport";
import policy from "./policy";
import header from "./header";
import footer from "./footer";
import home from './home';
import homeHero from './homeHero';
import aboutUs, { aboutPage } from './aboutUs';
import contactUs from './contactUs';
import imports, {
  importCategory,
  importProduct,
  exportPage,
  exportCategory,
  exportProduct,
  salesPage as sales,
  salesCategory,
  salesProduct,
} from './import';
import servicesPage from './servicesPage';
import photosPage from './photosPage';
import videosPage from './videosPage';
import tender from './tender';
import tendersPage from './tendersPage';
import localeString from './objects/localeString'
import localeText from './objects/localeText'
import localeList from './objects/localeList'
import jobPosting from './jobPosting'
import jobsPage from './jobsPage'


export const schema = [slider, annualReport, policy, header, footer, home, homeHero, aboutUs, aboutPage, contactUs, imports, importCategory, importProduct, servicesPage, exportPage, exportCategory, exportProduct, sales, salesCategory, salesProduct, photosPage, videosPage, tender, tendersPage, localeString, localeText, localeList, jobPosting, jobsPage];