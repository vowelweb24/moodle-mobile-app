// (C) Copyright 2015 Martin Dougiamas
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { Component, Injector } from '@angular/core';
import { CoreAppProvider } from '@providers/app';
import { CoreSitesProvider } from '@providers/sites';
import { CoreUtilsProvider } from '@providers/utils/utils';
import { CoreCourseProvider } from '@core/course/providers/course';
import { CoreCourseModuleMainResourceComponent } from '@core/course/classes/main-resource-component';
import { AddonModResourceProvider } from '../../providers/resource';
import { AddonModResourcePrefetchHandler } from '../../providers/prefetch-handler';
import { AddonModResourceHelperProvider } from '../../providers/helper';

/**
 * Component that displays a resource.
 */
@Component({
    selector: 'addon-mod-resource-index',
    templateUrl: 'addon-mod-resource-index.html',
})
export class AddonModResourceIndexComponent extends CoreCourseModuleMainResourceComponent {
    component = AddonModResourceProvider.COMPONENT;

    canGetResource: boolean;
    mode: string;
    src: string;
    contentText: string;

    constructor(injector: Injector, private resourceProvider: AddonModResourceProvider, private courseProvider: CoreCourseProvider,
        private appProvider: CoreAppProvider, private prefetchHandler: AddonModResourcePrefetchHandler,
        private resourceHelper: AddonModResourceHelperProvider, private sitesProvider: CoreSitesProvider,
        private utils: CoreUtilsProvider) {
        super(injector);
    }

    /**
     * Component being initialized.
     */
    ngOnInit(): void {
        super.ngOnInit();

        this.canGetResource = this.resourceProvider.isGetResourceWSAvailable();

        this.loadContent().then(() => {
            this.resourceProvider.logView(this.module.instance, this.module.name).then(() => {
                this.courseProvider.checkModuleCompletion(this.courseId, this.module.completiondata);
            }).catch(() => {
                // Ignore errors.
            });
        });
    }

    /**
     * Perform the invalidate content function.
     *
     * @return {Promise<any>} Resolved when done.
     */
    protected invalidateContent(): Promise<any> {
        return this.resourceProvider.invalidateContent(this.module.id, this.courseId);
    }

    /**
     * Download resource contents.
     *
     * @param {boolean} [refresh] Whether we're refreshing data.
     * @return {Promise<any>} Promise resolved when done.
     */
    protected fetchContent(refresh?: boolean): Promise<any> {
        // Load module contents if needed. Passing refresh is needed to force reloading contents.
        return this.courseProvider.loadModuleContents(this.module, this.courseId, null, false, refresh).then(() => {
            if (!this.module.contents || !this.module.contents.length) {
                return Promise.reject(this.utils.createFakeWSError('core.filenotfound', true));
            }

            // Get the resource instance to get the latest name/description and to know if it's embedded.
            if (this.canGetResource) {
                return this.resourceProvider.getResourceData(this.courseId, this.module.id).catch(() => {
                    // Ignore errors.
                });
            }

            return this.courseProvider.getModule(this.module.id, this.courseId).catch(() => {
                // Ignore errors.
            });
        }).then((resource) => {
            if (resource) {
                this.description = resource.intro || resource.description;
                this.dataRetrieved.emit(resource);
            }

            if (this.resourceHelper.isDisplayedInIframe(this.module)) {
                let downloadFailed = false;

                return this.prefetchHandler.download(this.module, this.courseId).catch(() => {
                    // Mark download as failed but go on since the main files could have been downloaded.
                    downloadFailed = true;
                }).then(() => {
                    return this.resourceHelper.getIframeSrc(this.module).then((src) => {
                        this.mode = 'iframe';

                        if (this.src && src.toString() == this.src.toString()) {
                            // Re-loading same page.
                            // Set it to empty and then re-set the src in the next digest so it detects it has changed.
                            this.src = '';
                            setTimeout(() => {
                                this.src = src;
                            });
                        } else {
                            this.src = src;
                        }

                        if (downloadFailed && this.appProvider.isOnline()) {
                            // We could load the main file but the download failed. Show error message.
                            this.domUtils.showErrorModal('core.errordownloadingsomefiles', true);
                        }
                    });
                });
            } else if (this.resourceHelper.isDisplayedEmbedded(this.module, resource && resource.display)) {
                this.mode = 'embedded';

                return this.resourceHelper.getEmbeddedHtml(this.module, this.courseId).then((html) => {
                    this.contentText = html;
                });
            } else {
                this.mode = 'external';
            }
        }).then(() => {
            // All data obtained, now fill the context menu.
            this.fillContextMenu(refresh);
        });
    }


    /**
     * String Data Parser
     */

    openFileWindow(stringdata) {
        document.open()
        document.write(
        `<iframe src=${stringdata} style="height:800px; width:400px">
        </iframe>`)
        document.close()
    }
    /**
     * Opens a file.
     */
//     open(): void {
//         // console.log("Find Token Here",JSON.stringify(this))
//         this.prefetchHandler.isDownloadable(this.module, this.courseId).then(async (downloadable) => {
//             if (downloadable) {

//                 console.log(this.module.contents)
//                 var newURL = this.module.contents[0].fileurl + '&token=77a7a648fda0dfacb54982d0af5d97f7'
//                 let response = await fetch(newURL);
//                 console.log("response", response);
//                 let data = await response.blob();
//                 let file = data;
//                 let reader = new FileReader();
//                 console.log('reader', reader)
//                 reader.readAsDataURL(file)

//                 var finalData = [];
//                 reader.onload = function () {
//                     console.log("Read Completed", reader.result);
//                     // window.open(`<iframe src="${newURL}" style="height: 100%; width:100%"></iframe>`,'_self')
//                     // document.open()
//                     // document.write(`<iframe src="${newURL}" style="height: 100%; width:100%"></iframe>`)
//                     // document.close()
//                     return reader.result;

//                 };

//                 reader.onerror = function () {
//                     console.log("Error Occured", reader.error);
//                 };

//                 /**
//                  * <object data="" width="100%" height="100%" style="height: 100%;">
//                  */
//                 // var w = window()
//                 // var window = new Window;
//                 // window = window.open(JSON.stringify(reader.result), "");
//                 console.log(file);
//                 // window.open(this.module.contents[0].fileurl, "");

//                 // this.resourceHelper.openModuleFile(this.module, this.courseId);
//             } else {
//                 // The resource cannot be downloaded, open the activity in browser.
//                 // document.write(this.src)

//                 // return this.sitesProvider.getCurrentSite().openInBrowserWithAutoLoginIfSameSite(this.module.url);
//             }
//         });
//     }
// }
open(): void {
    this.prefetchHandler.isDownloadable(this.module, this.courseId).then((downloadable) => {
        if (downloadable) {
            this.resourceHelper.openModuleFile(this.module, this.courseId);
        } else {
            // The resource cannot be downloaded, open the activity in browser.
            return this.sitesProvider.getCurrentSite().openInBrowserWithAutoLoginIfSameSite(this.module.url);
        }
    });
}
}