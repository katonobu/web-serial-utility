// MIT License
//
// Copyright (c) 2021-2022 Nobuo Kato (katonobu4649@gmail.com)
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

const controllButtons = (()=>{
    return ({
        divElement,
        sendCmdWaitRsp,
        actions,
        className,
    })=>{
        const onCmdBusyFreeUpdate = (isBusy) => {
            for(let outerIndex = 0; outerIndex < actions.length; outerIndex++) {
                for(let innerIndex = 0; innerIndex < actions[outerIndex].length; innerIndex++){
                    actions[outerIndex][innerIndex].element.disabled = isBusy;
                }
            }
        };

        const commonClickHandler = (el) => {
            const outer_index = parseInt(el.target.attributes.outer_index.value);
            const inner_index = parseInt(el.target.attributes.inner_index.value);
            const action = actions[outer_index][inner_index];
            sendCmdWaitRsp(action.cmd, action.timeout);
        }

        let outerCount = 0;
        let innerCount = 0;
        for(const action of actions) {
            const p = document.createElement('p');
            innerCount = 0;
            for(const act of action) {
                const button = document.createElement('input');
                button.type = 'button';
                button.value = act.str;
                button.setAttribute("inner_index",innerCount.toString(10));
                button.setAttribute("outer_index",outerCount.toString(10));
                button.addEventListener('click', commonClickHandler)
                button.disabled = true;
                if (className){
                    button.className = className;
                }
                actions[outerCount][innerCount].element = button;
                p.appendChild(button);
                innerCount += 1;
            }
            divElement.appendChild(p);
            outerCount += 1;
        }

        return {
            onCmdBusyFreeUpdate
        };  
    };
})();
