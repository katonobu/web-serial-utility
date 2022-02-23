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

const cmdRspHandler = (()=>{
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const unexpRxRsp = (rsp)=>{console.log("UnexpectedRxRsp:",rsp)};
    let serialInputLine = "";
    let onRxRsp = unexpRxRsp;
    let lastCmd = undefined;

    return (webSerialIoRet, {
        isRsp,
        parseByLine,
        lineSeparator = '\r\n',
        // type onOpen = (void) => void;
        onOpen,
        // type onClose = (void) => void;
        onClose,
        // type onError = (error: Error) => void;
        onError,
        // type onMessage = (message:Uint8Array) => void;
        onCmdBusy,
        onCmdFree,
        onNonRspMessage
    }={})=>{
        let _onError = onError?onError:(e)=>{console.log(e)};
        let _onCmdBusy = onCmdBusy?onCmdBusy:()=>{console.log("onCmdBusy()")};
        let _onCmdFree = onCmdFree?onCmdFree:()=>{console.log("onCmdFree()")};
        let _onNonRspMessage = onNonRspMessage?onNonRspMessage:(msg)=>{console.log("onNonRspMessage(",msg,")")};

        const updateHandlerCallbacks = ({onOpen, onClose, onCmdBusy, onCmdFree, onNonRspMessage, onError}) => {
            updateCallbacks({onOpen, onClose, onError})
            if (onError) {
                _onError = onError;
            }
            if (onCmdBusy) {
                _onCmdBusy = onCmdBusy;
            }
            if (onCmdFree) {
                _onCmdFree = onCmdFree;
            }
            if (onNonRspMessage) {
                _onNonRspMessage = onNonRspMessage;
            }
        }

        let _isRsp = isRsp;
        let _parseByLine = parseByLine;
        let _lineSeparator = lineSeparator;
        const updateParserOptions = ({isRsp, parseByLine, lineSeparator}) => {
            if (isRsp) {
                _isRsp = isRsp;
            }
            if (parseByLine) {
                _parseByLine = parseByLine;
            }
            if (lineSeparator) {
                _lineSeparator = lineSeparator;
            }
        }

        const lineParser = (rxUint8Array) => {
            const splitted = (serialInputLine + decoder.decode(rxUint8Array)).split(lineSeparator);
            serialInputLine = splitted.pop();
            return splitted;
        };

        const {
            openPort,
            closePort,
            sendMessage,
            updateCallbacks
        } = webSerialIoRet;
        updateCallbacks({
            onOpen,
            onClose,
            onMessage:(msgU8a)=>{
                if (parseByLine) {
                    const lines = lineParser(msgU8a);
                    for(line of lines){
                        const strippedLine = line.replace(/\r?\n/g,"")
                        if (lastCmd && _isRsp(strippedLine, lastCmd)) {
                            _onCmdFree();
                            onRxRsp(strippedLine);
                            onRxRsp = unexpRxRsp;
                            lastCmd = undefined;
                        } else {
                            _onNonRspMessage(strippedLine);
                        }
                    }
                } else {
                    if (lastCmd && isRsp(msgU8a, lastCmd)) {
                        _onCmdFree();
                        onRxRsp(msgU8a);
                        onRxRsp = unexpRxRsp;
                        lastCmd = undefined;
                    } else {
                        _onNonRspMessage(msgU8a);
                    }
                }
            },
            onError
        });
        sendCmdWaitRsp = async (msg, timeoutMs = 1000, onResolve = undefined)=>{
            let rspMsg = undefined;
            lastCmd = msg;
            _onCmdBusy();
            sendCmd(msg);
            try {
                rspMsg = await new Promise((resolve, reject) => {
                    let timerId = 0;
                    if (0 < timeoutMs) {
                        timerId = setTimeout(()=>{
                            onRxRsp = unexpRxRsp;
                            reject(new Error("Rsp Timeout"));
                        }, timeoutMs);
                    }
                    onRxRsp = (rxMsg) => {
                        if (0 < timerId) {
                            clearTimeout(timerId);
                        }
                        if (onResolve) {
                            onResolve(rxMsg);
                        }
                        resolve(rxMsg);
                    }
                });
            } catch(e) {
                onError(e);
            }
            return rspMsg;
        };
        sendCmd = (msg)=>{
            let u8a = undefined;
            if (parseByLine) {
                u8a = encoder.encode(msg+lineSeparator); 
            }else {
                u8a = msg
            }
            sendMessage(u8a);
        };
        return {
            openPort,
            closePort,
            sendCmdWaitRsp,
            sendCmd,
            updateCallbacks:updateHandlerCallbacks,
            updateParserOptions
        };  
    };
})()
