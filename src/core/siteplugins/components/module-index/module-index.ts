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
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { Component, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CoreTextUtilsProvider } from '@providers/utils/text';
import { CoreUtilsProvider } from '@providers/utils/utils';
import { CoreSitePluginsProvider } from '../../providers/siteplugins';
import { CoreCourseModuleDelegate, CoreCourseModuleMainComponent } from '@core/course/providers/module-delegate';
import { CoreCourseModulePrefetchDelegate } from '@core/course/providers/module-prefetch-delegate';
import { CoreCourseHelperProvider } from '@core/course/providers/helper';
import { CoreSitePluginsPluginContentComponent } from '../plugin-content/plugin-content';
import { UserAgent } from '@ionic-native/user-agent/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';

/**
 * Component that displays the index of a module site plugin.
 */
let successCallback = (isAvailable) => { console.log('Is available? ' + isAvailable); }
let errorCallback = (e) => console.error('Error' + e);
@Component({
    selector: 'core-site-plugins-module-index',
    templateUrl: 'core-siteplugins-module-index.html',
})
export class CoreSitePluginsModuleIndexComponent implements OnInit, OnDestroy, CoreCourseModuleMainComponent {
    @Input() module: any; // The module.
    @Input() courseId: number; // Course ID the module belongs to.

    @ViewChild(CoreSitePluginsPluginContentComponent) content: CoreSitePluginsPluginContentComponent;

    component: string;
    method: string;
    args: any;
    initResult: any;
    visible = true;
    // Data for context menu.
    externalUrl: string;
    description: string;
    refreshIcon: string;
    prefetchStatusIcon: string;
    prefetchText: string;
    size: string;
    displayOpenInBrowser = true;
    displayDescription = true;
    displayRefresh = true;
    displayPrefetch = true;
    displaySize = true;
    taglist: any;
    interval: any;

    jsData: any; // Data to pass to the component.

    protected isDestroyed = false;
    protected statusObserver;

    constructor(protected sitePluginsProvider: CoreSitePluginsProvider, protected courseHelper: CoreCourseHelperProvider,
        protected prefetchDelegate: CoreCourseModulePrefetchDelegate, protected textUtils: CoreTextUtilsProvider,
        protected translate: TranslateService, protected utils: CoreUtilsProvider,
        protected moduleDelegate: CoreCourseModuleDelegate,
        private iab: InAppBrowser, private androidPermissions: AndroidPermissions) { }

    /**
     * Component being initialized.
     */

    // myFunction() {
    //     var y = document.getElementById("bigbluebuttonbn-mobile-join")
    //     if (y) {
    //         // console.log("yyyyyyyyyyyyyyy", y)
    //         var disabled = document.getElementById("bigbluebuttonbn-mobile-join").hasAttribute("disabled");
    //         // var enabled = document.getElementById("bigbluebuttonbn-mobile-join").hasAttribute("disabled");
    //         if (disabled) {
    //             // console.log("xxxxxxxx", disabled);
    //             document.getElementById("custombbb").setAttribute("disabled", "");
    //             this.visible = false;
    //         }
    //     }
    // }

    ngOnInit(): void {
        this.refreshIcon = 'spinner';
        // this.diagnostic.getBluetoothState()
        //     .then((state) => {
        //         if (state == this.diagnostic.bluetoothState.POWERED_ON) {
        //             console.log("Allowed BlueTooth")
        //         } else {
        //             console.log("disllowed BlueTooth")
        //         }
        //     }).catch(e => console.error(e));

        // console.log('Diagnostic' + JSON.stringify(this.diagnostic.isBluetoothAvailable()))
        // this.taglist = setInterval(() => {
        //     if (this.refreshIcon === 'refresh') {
        //         if (document.getElementsByTagName('ion-list')[4]) {
        //             document.getElementsByTagName('ion-list')[4].lastElementChild.setAttribute("style", "display:none")
        //         }
        //     }
        //     else {
        //         clearInterval(this.taglist)
        //     }
        // }, 100);

        // this.interval = setInterval(() => {
        //     if (this.visible) {
        //         this.myFunction();
        //     }
        //     else {
        //         clearInterval(this.interval)
        //     }
        // }, 100);

        // if(this.refreshIcon === 'refresh' ){
        //     console.log("Spinner")}

        if (this.module) {
            const handlerName = this.moduleDelegate.getHandlerName(this.module.modname),
                handler = this.sitePluginsProvider.getSitePluginHandler(handlerName);

            if (handler) {
                this.component = handler.plugin.component;
                this.method = handler.handlerSchema.method;
                this.args = {
                    courseid: this.courseId,
                    cmid: this.module.id
                };
                this.initResult = handler.initResult;
                this.jsData = {
                    module: this.module,
                    courseId: this.courseId,
                };
                console.log("Loaded Contents", this.module);

                this.displayOpenInBrowser = !this.utils.isFalseOrZero(handler.handlerSchema.displayopeninbrowser);
                this.displayDescription = !this.utils.isFalseOrZero(handler.handlerSchema.displaydescription);
                this.displayRefresh = !this.utils.isFalseOrZero(handler.handlerSchema.displayrefresh);
                this.displayPrefetch = !this.utils.isFalseOrZero(handler.handlerSchema.displayprefetch);
                this.displaySize = !this.utils.isFalseOrZero(handler.handlerSchema.displaysize);
                // setTimeout(() => {
                //     console.log(document.getElementById("custombbb").setAttribute("disabled", ""))
                // }, 10);
                // document.getElementById("custombbb").setAttribute("onclick", "onPress()");
            }

            // Get the data for the context menu.
            this.description = this.module.description;
            this.externalUrl = this.module.url;
        }
    }

    // onPress() {
    //     var url: string;
    //     console.log(document.getElementById("bigbluebuttonbn-mobile-join").getAttribute('onclick'))
    //     url = document.getElementById("bigbluebuttonbn-mobile-join").getAttribute('onclick').replace("onPress('", '').replace("');", '');
    //     return this.iab.create(url, "_blank", { location: "no" });
    // }
    /**
     * Refresh the data.
     *
     * @param {any} [refresher] Refresher.
     * @param {Function} [done] Function to call when done.
     * @return {Promise<any>} Promise resolved when done.
     */
    doRefresh(refresher?: any, done?: () => void): Promise<any> {
        if (this.content) {
            this.refreshIcon = 'spinner';
            this.visible = true
            // document.getElementById("custombbb").setAttribute("enabled", "");
            return Promise.resolve(this.content.refreshContent(false)).finally(() => {
                refresher && refresher.complete();
                // this.taglist = setInterval(() => {
                //     if (this.refreshIcon === 'refresh') {
                //         document.getElementsByTagName('ion-list')[4].lastElementChild.setAttribute("style", "display:none")
                //     }
                //     else {
                //         clearInterval(this.taglist)
                //     }
                // }, 100);
                // var interval = setInterval(() => {
                //     if (this.visible) {
                //         this.myFunction();
                //     }
                //     else {
                //         clearInterval(interval)
                //     }
                // }, 100);
                done && done();
            });
        } else {
            refresher && refresher.complete();
            done && done();

            return Promise.resolve();
        }
    }

    /**
     * Function called when the data of the site plugin content is loaded.
     */
    contentLoaded(refresh: boolean): void {
        this.refreshIcon = 'refresh';
        // document.getElementById("custombbb").removeAttribute("disabled");
        // document.getElementById("bigbluebuttonbn-mobile-join").replaceWith(document.getElementById("custombbb"));
        // Check if there is a prefetch handler for this type of module.
        if (this.prefetchDelegate.getPrefetchHandlerFor(this.module)) {
            this.courseHelper.fillContextMenu(this, this.module, this.courseId, refresh, this.component);
        }
    }

    /**
     * Function called when starting to load the data of the site plugin content.
     */
    contentLoading(refresh: boolean): void {
        this.refreshIcon = 'spinner';
    }

    /**
     * Expand the description.
     */
    expandDescription(): void {
        this.textUtils.expandText(this.translate.instant('core.description'), this.description, this.component, this.module.id);
    }

    /**
     * Prefetch the module.
     */
    prefetch(): void {
        this.courseHelper.contextMenuPrefetch(this, this.module, this.courseId);
    }

    /**
     * Confirm and remove downloaded files.
     */
    removeFiles(): void {
        this.courseHelper.confirmAndRemoveFiles(this.module, this.courseId);
    }

    /**
     * Component destroyed.
     */
    ngOnDestroy(): void {
        this.isDestroyed = true;
        this.statusObserver && this.statusObserver.off();
        clearInterval(this.taglist);
        clearInterval(this.interval);
    }

    /**
     * Call a certain function on the component instance.
     *
     * @param {string} name Name of the function to call.
     * @param {any[]} params List of params to send to the function.
     * @return {any} Result of the call. Undefined if no component instance or the function doesn't exist.
     */
    callComponentFunction(name: string, params?: any[]): any {
        console.log("Here Contents are building");
        return this.content.callComponentFunction(name, params);
    }
}
