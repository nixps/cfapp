'use strict';

module.exports = function (start, end) {
  const startIso = start.toISOString().split('.')[0] + 'Z';
  const endIso = end.toISOString().split('.')[0] + 'Z';

  return {
      "customer_code": "BE-BLABA",
      "machines": [
        {
          "licenses": [
          ],
          "name": "pp_work_server"
        }
      ],
      "current_site": "PRODUCTION",
      "current_server": "PP_WORK_SERVER",
      "sites": [
        {
          "machines": [
            {
              "licenses": [
              ],
              "name": "pp_work_server"
            }
          ],
          "name": "PRODUCTION"
        }
      ],
      "products": {
        "sites": {
          "PRODUCTION": {
            "pp_work_server": [
              {
                "name": "Blibli License",
                "interval": [
                  "2019-09-25T22:05:14Z",
                  "2020-01-10T00:00:00Z"
                ]
              },{
                "name": "Demo License",
                "interval": [
                  startIso,
                  endIso
                ]
              },{
                "name": "Blabla License",
                "interval": [
                  "2019-09-25T22:05:14Z",
                  "2020-01-10T00:00:00Z"
                ]
              }
            ]
          }
        },
        "distributed": []
      }
    }
}