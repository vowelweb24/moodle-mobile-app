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

import { Component, ViewChildren, Input, OnInit, QueryList, ElementRef } from '@angular/core';
import { Content } from 'ionic-angular';
import { CoreDomUtilsProvider } from '@providers/utils/dom';
import { CoreCourseProvider } from '@core/course/providers/course';
import { CoreBlockComponent } from '../block/block';
import { CoreBlockHelperProvider } from '../../providers/helper';

/**
 * Component that displays the list of course blocks.
 */
@Component({
    selector: 'core-block-course-blocks',
    templateUrl: 'core-block-course-blocks.html',
})
export class CoreBlockCourseBlocksComponent implements OnInit {

    @Input() courseId: number;
    @Input() hideBlocks = false;
    @Input() downloadEnabled: boolean;

    @ViewChildren(CoreBlockComponent) blocksComponents: QueryList<CoreBlockComponent>;

    dataLoaded = false;
    blocks = [];

    protected element: HTMLElement;

    constructor(private domUtils: CoreDomUtilsProvider, private courseProvider: CoreCourseProvider,
        protected blockHelper: CoreBlockHelperProvider, element: ElementRef,
        protected content: Content) {
        this.element = element.nativeElement;
    }

    /**
     * Component being initialized.
     */
    ngOnInit(): void {
        this.loadContent().finally(() => {
            this.dataLoaded = true;
        });
    }

    /**
     * Invalidate blocks data.
     *
     * @return {Promise<any>} Promise resolved when done.
     */
    invalidateBlocks(): Promise<any> {
        const promises = [];

        if (this.blockHelper.canGetCourseBlocks()) {
            promises.push(this.courseProvider.invalidateCourseBlocks(this.courseId));
        }

        // Invalidate the blocks.
        this.blocksComponents.forEach((blockComponent) => {
            promises.push(blockComponent.invalidate().catch(() => {
                // Ignore errors.
            }));
        });

        return Promise.all(promises);
    }

    move(arr, old_index, new_index) {
        while (old_index < 0) {
            old_index += arr.length;
        }
        while (new_index < 0) {
            new_index += arr.length;
        }
        if (new_index >= arr.length) {
            var k = new_index - arr.length;
            while ((k--) + 1) {
                arr.push(undefined);
            }
        }
        arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
        return arr;
    }

    /**
     * Convenience function to fetch the data.
     *
     * @return {Promise<any>} Promise resolved when done.
     */
    loadContent(): Promise<any> {
        return this.blockHelper.getCourseBlocks(this.courseId).then((blocks) => {
            this.blocks = blocks;
        }).catch((error) => {
            this.domUtils.showErrorModal(error);

            this.blocks = [];
        }).finally(() => {

            setTimeout(() => {
                console.log("this");
                var clas = document.getElementsByClassName('name');
                if (clas.length > 0) {
                    for (var i = 0; i < document.getElementsByClassName('name').length; i++) {
                        var date = document.getElementsByClassName('date')[i].textContent
                        console.log("hello", date)
                        document.getElementsByClassName('name')[i].setAttribute("style", "display: none")
                        document.getElementsByClassName('date')[i].setAttribute("style",
                            "color:black; font-size: 1.2rem; color:#808080; padding-bottom:10px; border-bottom:1px solid #e2e2e2")
                        document.getElementsByClassName('info')[i].firstElementChild.setAttribute("style",
                            "color:#454545; font-size: 1.55rem;; text-decoration: none;")
                    }
                }
                document.getElementsByClassName('date')[2].setAttribute("style",
                    "color:black; font-size: 12px; color:#808080; padding-bottom:10px; border-bottom:1px solid #e2e2e2; margin-bottom: -36px;")
                var htmlarray;
                htmlarray = document.getElementsByClassName('item item-divider item-md item-divider-md ng-star-inserted')
                var editThisHtml: any = null
                var icon = document.createElement("ion-icon");
                icon.setAttribute("name", "megaphone");
                icon.setAttribute("role", "img");
                icon.setAttribute("class", "icon icon-md ion-md-megaphone ng-star-inserted")
                icon.setAttribute("aria-label", "megaphone")
                icon.setAttribute("ng-reflect-name", "megaphone");
                icon.style.cssText = 'margin-right:10px'
                // icon.style("margin-right","10px")
                for (var j = 0; j < htmlarray.length; j++) {
                    if (htmlarray[j].innerText === "Latest announcements" || htmlarray[j].innerText === "Latest news") {
                        editThisHtml = htmlarray[j]
                        console.log("editThisHtml",editThisHtml);
                    }
                }

                var oldHtml = editThisHtml.getElementsByClassName('item-inner')[0].innerHTML;
                var new_html = `<a style='width: 97%;color: #414141;background: #fff;'>
                <div class='item-inner'><div class='input-wrapper custom_back'>` +oldHtml +
                "</div></div></a>";
                editThisHtml.getElementsByClassName('item-inner')[0].innerHTML = new_html

                // a.appendChild(editThisHtml.getElementsByClassName('item-inner')[0].after(a))
                // a.appendChild(oldHtml) <div style='color: #dedede;margin-right:10px'><p>❯</p></div>

                editThisHtml.getElementsByClassName('item-inner')[0].before(icon);
                editThisHtml.setAttribute("style","padding-top:10px; padding-bottom:10px;margin-top: 15px;")
                console.log(editThisHtml.getElementsByClassName('item-inner')[0])
                var LA:any = document.getElementsByTagName("core-format-text");
                var mLA;
                console.log()
                for(var q =0 ; q< LA.length; q++){
                    if(LA[q].innerText  === "Latest announcements" || LA[q].innerText === "Latest news"){
                        mLA = LA[q]
                        mLA.setAttribute("style","margin-left:15px")
                        console.log("mLA",mLA)
                    }
                }

            }, 10);
            // console.log("this.blocks",document.getElementsByClassName('name')[0], this.blocks[1].contents.title);
            if (this.blocks.length > 0) {
                this.element.classList.add('core-has-blocks');
                this.element.classList.remove('core-no-blocks');

                this.content.getElementRef().nativeElement.classList.add('core-course-block-with-blocks');
            } else {
                this.element.classList.remove('core-has-blocks');
                this.element.classList.add('core-no-blocks');
                this.content.getElementRef().nativeElement.classList.remove('core-course-block-with-blocks');
            }
        });
    }
}
