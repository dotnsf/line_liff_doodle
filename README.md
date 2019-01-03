# Line LIFF Doodle

## Overview

Sample Application for LIFF(LIne Front-end Framework), which can upload your doodle in your LINE message.


## Pre-requisite

- LINE account

- LINE Developer account

    - https://developers.line.biz/ja/

- LINE Channel ( as Messaging API )

    - Application size need to be **tall** or **full**.

    - Longterm Access Token

    - LIFF URL

- Public application server for Node.js

    - I would describe followings as you use IBM Cloud for this environment.


## Pre-requisite for IBM Cloud user

- Node.js runtime

- IBM Cloudant

    - Create one database named **doodledb**


## Install

- Download source from github.com

    - https://github.com/dotnsf/line_liff_doodle.git

- Edit settings.js with following information:

    - exports.db_username : username for IBM Cloudant

    - exports.db_password : password for IBM Cloudant

    - exports.base_url : Base application URL

    - exports.line_access_token : Longterm Access Token for LIFF application

- Deploy application into IBM Cloud

- Set endpoint URL in you LIFF application setting, and get LIFF URL(line://app/XXXXXX..)

- Paste LIFF URL as your LINE message, and click that URL.



## Links

- LIFF

    - https://developers.line.me/ja/docs/liff/overview/

- LIFF API References

    - https://developers.line.biz/ja/reference/liff/


## Copyright

2018-2019 [K.Kimura @ Juge.Me](https://github.com/dotnsf) all rights reserved.

