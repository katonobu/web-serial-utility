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

const pseudoSerialService = (()=>{
    let serialInputLine = "";
    const evts = []
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    return ({
        sendMessage,
        logWrite = console.log,
        lineSeparator = '\r\n'
    })=>{
        const serialRxParser = (rxUint8Array) => {
            const splitted = (serialInputLine + decoder.decode(rxUint8Array)).split(lineSeparator);
            serialInputLine = splitted.pop();
            return splitted;
        };

        const handleInputLine = (str, setTxStr) => {
        // "< TEST RESET"
        //  内部状態を初期化する。
        //  5秒後にレスポンスを返す
            if (str.startsWith("< TEST RESET")) {
                setTimeout(()=>setTxStr(str.replace('<','>')), 5000)
                for(let i = 0; i < evts.length; i++){
                    const evt = evts[i];
                    if( evt && 'timerId' in evt && 0 < evt.timerId) {
                        clearInterval(evt.timerId)
                    }
                    evts[i] = undefined
                }
        // "< TEST RSP n"
        //  n[ms]後にレスポンスを返す。
        //  nが0のときは、レスポンスを返さない。
        //  →"< TEST RESET"コマンドで状態を初期化するまでコマンドを受け付けなくなる。
            } else if (str.startsWith("< TEST RSP")) {
                const splits = str.split(' ');
                if (3 < splits.length) {
                    const waitMs = parseInt(splits[3])
                    if(0 < waitMs) {
                        setTimeout(()=>setTxStr(str.replace('<','>')), waitMs)
                    }
                } else {
                    setTxStr("> ERR INVALID ARG")
                }
        // "< TEST EVT n,m,p"
        //  n種類目のイベントを起動させる。
        //  m[ms]間隔でp回イベントを繰り返す。
        //  mが0の時は当該イベントの動作停止
        //  pが0の時は動作停止まで無限に繰り返す。
        // "| TEST EVT n,i" // i回目のイベント
            } else if (str.startsWith("< TEST EVT")) {
                const splits = str.split(' ');
                if (3 < splits.length) {
                    const [id, intervalMs, maxCount] = splits[3].split(',').map((val)=>parseInt(val))
                    // console.log(id, intervalMs, maxCount, evts[id])
                    if(id !== undefined) {
                        if (evts[id] && 'timerId' in evts[id] && evts[id].timerId !== 0) {
                            clearInterval(evts[id].timerId)
                        }
                        evts[id] = {
                            interval:intervalMs,
                            currentCount:0,
                            maxCount:maxCount,
                            timerId:(0 < intervalMs)?
                                setInterval(()=>{
                                    evts[id].currentCount += 1;
                                    // console.log(evts[id])
                                    if (0 === evts[id].maxCount){
                                        setTxStr("| TEST EVT " + id.toString(10) + "," + evts[id].currentCount.toString(10) + "," + maxCount)
                                    } else {
                                        if (evts[id].currentCount < evts[id].maxCount) {                                
                                            setTxStr("| TEST EVT " + id.toString(10) + "," + evts[id].currentCount.toString(10) + "," + maxCount)
                                        } else {
                                            // console.log("Terminate")
                                            clearInterval(evts[id].timerId)
                                        }
                                    }
                                }, intervalMs)
                            :
                                0
                        }
                        setTxStr(str.replace('<','>'))
                        if (intervalMs !== 0) {
                            setTxStr("| TEST EVT " + id.toString(10) + "," + evts[id].currentCount.toString(10))
                        }
                    } else {
                        setTxStr("> ERR INVALID ARG")
                    }
                } else {
                    setTxStr("> ERR INVALID ARG")
                }
            }
        }
        
        const service = (rxMessage) => {
            const lines = serialRxParser(rxMessage);
            for (const line of lines) {
                if (0 < line.length) {
                    logWrite("RxLine:"+line.replace(/\r?\n/g,""));
                    handleInputLine(
                        line, 
                        (txStr)=>{
                            logWrite("TxLine:"+txStr.replace(/\r?\n/g,""));
                            const u8a = encoder.encode(txStr+lineSeparator); 
                            sendMessage(u8a);
                        }
                    );
                }
            }
        }
        
        return {
            service
        };  
    };
})();
