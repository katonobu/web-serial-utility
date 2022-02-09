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

const buttonActions = [
    [
        {
            str:"TARGET RESET",
            cmd:"< TEST RESET",
            timeout:5500
        },
    ],[
        {
            str:"SEND 2sec",
            cmd:"< TEST RSP 2000",
            timeout:3000
        },
        {
            str:"SEND 1sec",
            cmd:"< TEST RSP 1000",
            timeout:2000
        },
        {
            str:"SEND 500msec",
            cmd:"< TEST RSP 500",
            timeout:1000
        },
        {
            str:"SEND 100msec",
            cmd:"< TEST RSP 100",
            timeout:200
        },
        {
            str:"SEND 50msec",
            cmd:"< TEST RSP 50",
            timeout:100
        },
    ],[
        {
            str:"EVT 2sec infinit",
            cmd:"< TEST EVT 2,2000,0",
            timeout:100
        },
        {
            str:"STOP EVT 2sec infinit",
            cmd:"< TEST EVT 2,0,0",
            timeout:100
        },
    ],[
        {
            str:"EVT 1sec 10times",
            cmd:"< TEST EVT 0,1000,10",
            timeout:100
        },
        {
            str:"EVT 0.5sec 20times",
            cmd:"< TEST EVT 1,500,20",
            timeout:100
        },
        {
            str:"EVT 0.1sec 100times",
            cmd:"< TEST EVT 3,100,100",
            timeout:100
        },
    ]
];
