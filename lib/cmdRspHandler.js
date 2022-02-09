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
    let serialInputLine = "";
    let onRxRsp = undefined;
    let lastCmd = undefined;

    return ({
        parseByLine,
        isRsp,
        // type onOpen = (void) => void;
        onOpen,
        // type onClose = (void) => void;
        onClose,
        // type onMessage = (message:Uint8Array) => void;
        onCmdBusy,
        onCmdFree,
        onNonRspMessage,
        // type onError = (error: Error) => void;
        onError,
        lineSeparator = '\r\n'
    })=>{
        const lineParser = (rxUint8Array) => {
            const splitted = (serialInputLine + decoder.decode(rxUint8Array)).split(lineSeparator);
            serialInputLine = splitted.pop();
            return splitted;
        };

        const {
            openPort,
            closePort,
            sendMessage
        } = webSerialIo({
            onOpen,
            onClose,
            onMessage:(msgU8a)=>{
                if (parseByLine) {
                    const lines = lineParser(msgU8a);
                    for(line of lines){
                        const strippedLine = line.replace(/\r?\n/g,"")
                        if (lastCmd && isRsp(strippedLine, lastCmd)) {
                            if (onCmdFree) {
                                onCmdFree();
                            }
                            if (onRxRsp) {
                                onRxRsp(strippedLine);
                            } else {
                                console.log("Discarded:", strippedLine);
                            }
                            lastCmd = undefined;
                        } else {
                            onNonRspMessage(strippedLine);
                        }
                    }
                } else {
                    if (lastCmd && isRsp(msgU8a, lastCmd)) {
                        if (onCmdFree) {
                            onCmdFree();
                        }
                        if (onRxRsp) {
                            onRxRsp(msgU8a);
                        } else {
                            console.log("Discarded:", msgU8a);
                        }
                        lastCmd = undefined;
                    } else {
                        onNonRspMessage(msgU8a);
                    }
                }
            },
            onError
        });
        sendCmdWaitRsp = async (msg, timeoutMs = 1000, onResolve = undefined)=>{
            let rspMsg = undefined;
            lastCmd = msg;
            if (onCmdBusy) {
                onCmdBusy();
            }
            sendCmd(msg);
            try {
                rspMsg = await new Promise((resolve, reject) => {
                    let timerId = 0;
                    if (0 < timeoutMs) {
                        timerId = setTimeout(()=>{
                            onRxRsp = undefined;
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
                if (onError) {
                    onError(e);
                }
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
        };  
    };
})()
