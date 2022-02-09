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

const serialPortSelector = (()=>{
    let portCounter = 1;
    return ({
        // select-DOMオブジェクト
        // 例
        //   <select id="ports"></select>
        //  に対して
        //   document.getElementById('ports');
        portSelector,
        requestPortOption = {},
    })=>{
        /**
         * Returns the option corresponding to the given SerialPort if one is present
         * in the selection dropdown.
         *
         * @param {SerialPort} port the port to find
         * @return {PortOption}
         */
        function findPortOption(port){
            for (let i = 0; i < portSelector.options.length; ++i) {
                const option = portSelector.options[i];
                if (option.value === 'prompt') {
                    continue;
                }
                const portOption = option;
                if (portOption.port === port) {
                    return portOption;
                }
            }

            return null;
        }

        /**
        * Adds the given port to the selection dropdown.
        *
        * @param {SerialPort} port the port to add
        * @return {PortOption}
        */
        function addNewPort(port){
            const portOption = document.createElement('option');
            if (port) {
                portOption.textContent = `Port ${portCounter++}`;
                portOption.port = port;
            } else {
                portOption.textContent = 'Add a port...';
                portOption.value = 'prompt';
            }
            portSelector.appendChild(portOption);
            return portOption;
        }

        /**
        * Adds the given port to the selection dropdown, or returns the existing
        * option if one already exists.
        *
        * @param {SerialPort} port the port to add
        * @return {PortOption}
        */
        function maybeAddNewPort(port){
            const portOption = findPortOption(port);
            if (portOption) {
                return portOption;
            }
            return addNewPort(port);
        }

        /**
         * return port.
         */
        async function getSelectedPort(){
            let gotPort = undefined;
            if (portSelector) {
                if (portSelector.value == 'prompt') {
                    try {
                        const serial = navigator.serial;
                        gotPort = await serial.requestPort(requestPortOption);
                    } catch (e) {
                        return undefined;
                    }
                    const portOption = maybeAddNewPort(gotPort);
                    portOption.selected = true;
                } else {
                    const selectedOption = portSelector.selectedOptions[0];
                    gotPort = selectedOption.port;
                }
            } else {
                try {
                    const serial = navigator.serial;
                    gotPort = await serial.requestPort(requestPortOption);
                } catch (e) {
                    return undefined;
                }
            }
            return gotPort;
        }

        function selectIfPortHistoryIsOneElement(){
            // 過去に接続したポートで、今接続されているポートが1つしかなければ
            if (portSelector.options.length == 2){
                // そのポートをDefaultで選択する。
                portSelector.options[1].selected = true;
            }
        }

        async function initSerialPortSelector() {
            addNewPort(undefined);

            // 過去に接続したポートで、今接続されているポートのリストを取得
            const ports = await navigator.serial.getPorts();
            // Port選択DropDownlistに追加
            ports.forEach((port) => addNewPort(port));

            selectIfPortHistoryIsOneElement();

            // このページを開いている間に、過去に接続したポートが接続されたときのイベントハンドラ
            navigator.serial.addEventListener('connect', (event) => {
                addNewPort(event.target);
                selectIfPortHistoryIsOneElement();
            });
            // このページを開いている間に、過去に接続したポートが取り外されたときのイベントハンドラ
            navigator.serial.addEventListener('disconnect', (event) => {
                const portOption = findPortOption(event.target);
                if (portOption) {
                    portOption.remove();
                    selectIfPortHistoryIsOneElement();
                }
            });
        }

        if (portSelector) {
            initSerialPortSelector();
        }
        return {
            // type getSelectedPort = (void)=> Promise<SerialPort | undefined>
            getSelectedPort,
        };  
    };
})()
