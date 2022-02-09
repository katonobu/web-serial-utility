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

const webSerialIo = (()=>{
    let port = undefined;
    let reader = undefined;
    return ({
        // type onOpen = (void) => void;
        onOpen,
        // type onClose = (void) => void;
        onClose,
        // type onMessage = (message:Uint8Array) => void;
        onMessage,
        // type onError = (error: Error) => void;
        onError,
    })=>{
        const markDisconnected = ()=>{
            //        console.log('markDisconnected is called');
            port = undefined;
            if ( onClose ) {
                onClose();
            }
        };
            
        // type openPort = (port: SerialPort, options: SerialOptions) => Promise<void>;
        const openPort = async (port_arg, options) => {
            //        console.log('openPort is called');
            try{
                await port_arg.open(options);
                port = port_arg;
                if (onOpen) {
                    onOpen();
                }
            } catch (e) {
                if (onError) {
                    onError(e);
                }
                markDisconnected();
                return;
            }
            
            while (port?.readable) {
                try {
                    reader = port.readable.getReader()
                    for (;;) {
    //                    console.log('before reader.current.read()');
                        const {value, done} = await reader.read();
    //                    console.log('return from reader.current.read()');
                        if (value) {
                            if (onMessage){
                                onMessage(value);
                            }
                        }
                        if (done) {
                            break;
                        }
                    }
                    reader.releaseLock();
                    reader = undefined;
                } catch (e) {
                    if (onError) {
                        onError(e);
                    }
                }
            }
            if (port) {
                try {
                    await port.close();
                } catch (e) {
                    if (onError) {
                        onError(e);
                    }
                }
                markDisconnected();
            }
        };

        // type closePort = (void) => Promise<void>;
        const closePort = async () => {
            const localPort = port;
            port = undefined;
            if (reader) {
                await reader.cancel();
            }
          
            if (localPort) {
                try {
                    await localPort.close();
                } catch (e) {
                    if (onError) {
                        onError(e);
                    }
                }
            }
            markDisconnected();        
        };

        // type sendMessage(message: Uint8Array) => void;
        const sendMessage = (message) => {
            if (port?.writable) {
                try {
                    const writer = port.writable.getWriter();
                    writer.write(message);
                    writer.releaseLock();        
                } catch (e) {
                    if (onError) {
                        onError(e);
                    }
                }
            } else {
                if (onError) {
                    onError(new Error("Can't send message, serial pot may not open."));
                }
            }
        };

        return {
            openPort,
            closePort,
            sendMessage
        };  
    };
})()
