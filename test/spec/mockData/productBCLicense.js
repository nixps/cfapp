'use strict';

module.exports = function (start, end) {
  const startTime = Math.floor(start.getTime() / 1000);
  const endTime = Math.floor(end.getTime() / 1000);

  return {
      "customer_code": "BE-BLIBI",
      "machines": [
        {
          "licenses": [
          ],
          "name": "pp_second_server"
        },
        {
          "licenses": [
            {
              "name": "mars-codec",
              "code": "mars-codec"
            },
            {
              "name": "mars-codeb",
              "code": "mars-codeb",
              "start": startTime,
              "end": endTime
            }
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
              "name": "pp_second_server",
              "system_id": "10690A215402C1CEF87203A30DA562B7D8A9DBF1AC",
              "activation": "not needed"
            },
            {
              "licenses": [
                {
                  "name": "mars-codec",
                  "code": "mars-codec"
                },
                {
                  "name": "mars-codeb",
                  "code": "mars-codeb",
                  "start": startTime,
                  "end": endTime
                }
              ],
              "name": "pp_work_server",
              "system_id": "7C762A3F7D45BF1F73FBB6602199CAB0DE2B62F081",
              "activation": "not needed"
            }
          ],
          "name": "PRODUCTION"
        }
      ],
      "products": {
        "sites": {
          "PRODUCTION": {
            "pp_second_server": [
              {
                "name": "Blibli Extension",
                "interval": [
                  "2019-09-25T22:05:33Z",
                  "2020-01-10T00:00:00Z"
                ]
              }
            ],
            "pp_work_server": [
              {
                "name": "Blibli"
              },
              {
                "name": "Blabla"
              },
              {
                "name": "Dada",
                "interval": [
                  "2019-09-25T22:05:33Z",
                  "2020-01-10T00:00:00Z"
                ]
              },
              {
                "name": "Titi",
                "interval": [
                  "2019-09-25T22:05:33Z",
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
