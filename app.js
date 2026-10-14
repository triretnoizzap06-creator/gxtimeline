(function () {
'use strict';

/* ================= Constants ================= */
var STORE_KEY = 'gx27.dashboard.v3';
var UI_KEY = 'gx27.ui.v2';
var EVENT_DATE = '2026-11-21';
var PREP_DEADLINES = ['2026-10-13','2026-10-16','2026-10-20','2026-10-23','2026-10-24','2026-10-26','2026-10-30'];
// Logo embedded in the code so it never depends on a separate file being uploaded/deployed
var DEFAULT_LOGO = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAlUAAABnCAYAAAApK7c9AAAACXBIWXMAAAsSAAALEgHS3X78AAAgAElEQVR4nO2dPXMUx9bH/4dykUrcL6A1T/4gF7dIta7yjb03wCnrhBtajnDGkuEIEeLEqxQHV8S4yqMQCsrSB4Bn9QVACiHpJ+jTqHc0M/0y3TOzu+dX1SXYmenX092n306TUgqbBBGNAEwjPp0rpRYp47LqENEUwCjws0IpVSSPjOANEY0BjAM/Wyil5skjIwiCsEZ81XcEemAE4GHEdwWARcqIrAFTAHsR3xVpoyEEMkZ4HTgGME8eE0EQhDXiWt8REARBEARBWAdEqRIEQRAEQUiAKFWCIAiCIAgJEKVKEARBEAQhAaJUCYIgCIIgJECUKkEQBEEQhASIUiUIgiAIgpAAUaoEQRAcEFFBRKrBFX3HURCE/hGlShAEQRAEIQGiVAmCIAiCIHhARCO+6qsSUaoEQRAEQRBqIKJtIpoT0QmAAwAT3hJwQkQT+91NvPtPEARBEATBCRHtAjgCMFNKTUvPRgAOiGhinslMlSAIgiAIQgki2oZWqCYARvbBFCKaAThXSk343RkgSpUgCIIgCEIVB9AzVCf8/1MA3wKYA5iyA89STYloJMt/giAIgiAIV9ktLfmdK6UK4MvS3wRa8QKAGYBJMqWK1x23Kx6dW1qeIHjTcMJipWSKp5B3m94xFVUQBEHoH+5/KvsZ3pw+BVBYPxcADqKVKktLmwDYc7wLAC+g1yaPlFLnNe8dwNH5VHCilNoP/GZl4Hy2nc05uNDXoVNmxXwKYAzgluNdADjGpUwt8sbOD07DGFqOd+FIh/UdAFxAV8wCA0qTsN6UBi+dDFjWeRButdlX6LKdHko8UtAwwF5kbifLfu8RkeJ/HwP4onsopRZEtB2sVHHi9gF8H/jp9+wOWHk6qFCuduFQ0NadEGW19B2g13sLAIVS6ih97PJARFPoqdOdwE/32D0homPote8iaeQ84DoxhVamQtNgs4XLemLSNFdKzdvFMD88GzdHdUdpsyifoMkQF5/B2ZcNpp7fuPzbjbSqvu+rRHA9mTa84hxgWkr/BDpNW6VXjvl5MrhNs8NsrCPclp3hcoBR5Oo4OT8Omt5RSo0dfoxxmTafCYYz6MFw4yRDCFz/7Hj4DEoHOYjzkNHy+0Cevm+Bq/X+WCk15vZiYpcdy8ECSikvB91YHgFQidw5R8oOo4jwp/BNA4cxjozvOCScUAfdWJ4kzt8DAKOMcY4pr5n1/W7iNCuW0WxpLtWHfeiKlzL+VW6RUv6gFdjk9Qy6EQySgUz1KLg+R8pyCuddrh7lVltG8G9fnOUcWBap8vUIpf4iURzHrrAb6v8Maer/HJFtFsd/niiPixB5TFwOKdvTc86T3QTxWgDYtupfYcX3HMv92QGAqa/HE/YgR6NyYIVTxAhC6kpU47IIG3TDk0KQXJV2O0PcY8prZqU7V3rPAUwzVv4Z8tWH7OWITEqV1bD0Up+glXSfctlPJMspnHc+eJTblTKCbrsXqcvZEc/QMEPcIqXsIEKpgu78c9T/OTzrN/SyXi6ZLdDBwLQk17na01aDbOh+6sCKZ1F6do7LrTknSin4eOrbSLYSphYNW1AjgIEoVcgzS9PkzlHRmbRMQ0x5zZBuZOVyB4nTO0U/ypTtTtBSsUJGpSpALs7bpqMU5jb86tNRQllO4bzbFY9yK0rvz3OWc0X8Rh3m41EK+UGAUsUyljt9CzhmWDzkIIXLNjAt5f2iI3mZtYjnEbQiPSqXDafhf1kudpVScHk27yjBisMqIr4LagQwAKUKeWdpXK6yU4lMR0x5da2UzBOkcxSZ1lyulWKF/EqVmRp3piOhLM49wlvU5VuP5evdrniUW2Hlf+yALag9teKWczWjqTxbLfHAU6mC/yxoCndelS50o9SVXdKBacs2qK0rENluQk8uFdBybpYDdzkdJ3Z5tW2khuCCGgH0rFT1nK8FEk7rYliKRpObt0jjCP3PTlW5aOUYmZWqwHrWutGGHkW6wqnsqAYgy97tike5Ffxem72vQeXM4U17yjtTrtMWsuMjp10qVJXyinaKcluXeoVj3qO8LClAgfE2hxoKdkfQsr+kqA0x0aEuV2Nfdt6N3wCFaZEi/gPqiGJcdOeNbpbAY1xUZ4IOlCoOx0fZUWixARm6oWudVz3Ksne99Ci3IrJso8sZ/SpUrWUIfv1BX8rMAlqZ6lOhCpZTR37PByAr58i4Z+yKSQU+tnuv/LvQDiKao/t8vYBWJmYdhztEfiKiQsUdt53Bw3ZWD8ygG6lBopQ64GPGLvMrcyLaVYFHuq17uVwcKrdZin00m4M4QHP5n8KyWROAlzkFT0YAHib0rxHuK34P/OwUuswKlGxSWbarxtDLLCH1bU5EY5XHxpVvPIyphHIcdqHLJrT92MGluYeQby84DkXp923Emy06IqKRamH+IbIPfAGdjhOUbFJx2zKCTtME/uZstqDTM26TnlpKWuQIw1zqaHKhI6txZDjRmjr6WT+ew0MbB3cmkekqBlD+IS56czT8Z0S6dtOO5DGonllhbcNvM2rwPjH4LXMl2bcFt6xH5U9P7UiBy4GCs41oqA8hfcUcgcsuHMY8IIxFhAyNW+blAryJ2SOsEfKddPM2IwBdJ6cI3yQ+ayG7vrPWJi2ziLKcIKxPSra/eCkegQ3HEF1QY4aOlaoW4cW6E9+4WnGLEq4VlZd5i4ZhFlkeR/xt2aWY0g8uu8h0BNWzUni+HbB32cB/H9UoSUO5HkrVLGF++Mqud3vUENYY/gpAUH1Au/Z5FpkeM8Patu5/STPiB4uhyk5wOAibrGl9qhNhJi/S2z5LJFy2W0BPWU5gjhjqTB1zYlOvDRcdVaLghgH+p6BSuGCTCaWyCBYupFeqjmCdrrDC2UVaQ5vBZVmTZ03pmJbT0dDgtGpgI9IwiwgnqJ5VhDn1DGfq4ZfvrGGyBtND1lvlT8ZyUyyzox7ikcTsAYcZsq9oHODvOCI/Gw89BIQ9jyzPoPriWZ98+6ng8DzqjnGzhDLqm6bo1YvasCMSXucWvhnOgpxKuSoCMzumEgVVVCusrjY4z0MFA1c7uWDhSiAzxoXMrs0ShNfm5NwI1ZU1asra8jdkxNhKNiPzMKie1YQ79wjHdUrPd6AyaxvfQFlvnT+Zym2eOA518p813IByCCoLhPcHSRSqwDpR56YJ4zH1DDNoOR3+tywkS4sVtq9iNUsarhV4bMEqRI5IWgpUVGMWUYmMGweGM0qQNmfa0VDBP73C9qdXldaj6zqmIOFCGqUqWHYCKkuTG7WorLYC1EqZSpSf08BwZjGyliB9vrMNtfurPPOodVwjwk0eZoJyS75nBH5tdvD+uAwyNPb0bxyYp8kUKis9MW3ZLEPe+s6Ye5ct/FYX5hnrjE9fkXS26ho0MadWDIdKqaWLBX1R+mLVRy3CHjKzjH5fAPhRKTVWNaddPr+mKS6P5JaZofqSyn0+UdUVxzGyw2keQ+dDLJPYD5VSB9AXz76AVs5mMfJfwSzyu1GCsLPDeTSBu9xuoeJUIxHN4D65dIYWZbtGnKH58uVguG3wydtpovpwBfZ36vFqmz6tjkd17W0snJ7QuJ6qPCe6feOx6/MSn87bcbx2qjJesM7lNXO8toWUdYW1udhRf9Gxhtw6Duhgpgp5Z6lmaNCqP73C7qdXKD69gvr0CouIuHmPgNBupqr16AD+U8tVLpk175Qusi4G2eBCTzNVEeW2b30z9vwm6UxCgKwny59E5TbOEP7UI9xZR/XEJy9GHv74ylXyvTdWHLYD62LysrXi4tMXe5Ux/GY1s6WlFBfX7OYiVVjX2DZI1ayFiwuk0+6maDfrMDRyjJSPAXytamZFPr+m7c+vaQ7gb1yO5qtGHnNHONMWcQxhWpWOEJS2OXUY+fmtjmflfIkZCXuNHIcCl9tTj1efENFugD2qn1UeO0WrxrFSqsjgr0+7dpAh3NhwUrbD87btVR3s7wvP188yla3Bx++Rp1/3HM9zyWkVM8fzHSIapQjoGrSmHsNcBRrrq4OFap7Cr4EwTejXGYB/K73Ut6h64fNrMifjbCE+vn5n2dAlEU3gXj7ZYUU7J8cqzghnFW2m+ceJ4iAEopTahx4ouDhi5xr4HSq9LCtkaEtZsXUZcT3MpXiU4XBcA6pxwiDnCf2qwncwkFvGC493Rq4XuK9xMfd4Jwnc35w5XkuihF9D/Cg3deHOE/vXC9z4pLC8fQG9hj+qU0A+v6bx59d0AuAJrnY604pPfMts7BvJSOapPPJsXOtIpjzyjMo+Ec2JqCCiBRGpUIc4a8eris/+qh248yTWmvm6kmrAYuNTV3KE2ya8caJwLjqYAS0SvxdFwnRurLxcQ9wm17NUs1QGLsx1WAJM0VG/gN4bMqt6+Pk1jT6/piMAf6FagXt6/c5y+fAm3x3P8Me+EY0kdWWK9a9VWRHRmJWoc+hl1yfQs4V78M/rjUVdblxvwwUyboxeQY4z5cXY450iQ7htwttKtKTTxZKyV5l1tLztmtHxaTfHjuenPdTZwvE8ySA7dqaqSBF4BeuwH2Lc4ttTAN8qfSJuUfXC59c0g86nuqn4C5TWj7lhCRnJ51z+S97ot1hKjNpTRUQTIlpAK7X3ELcnUQDAeyp+buHFVPZRLZErL0aO52ddd5IcnksBGCUIqkjgRyOeMnyaOx7MwvHcp71z9SF91FlXmEkGwl8hrkNYpAi8ghOs/vLHKOKbC+gTFbXLc59f0wR6+c5V8PvX71xp3GYIK+ecsyy5KtMxMsuOtWF61WV0UCj/i5fLPE24N29dWGTyd+R4vsPL10NjF93PoOVilWZjXf3NPSJybWTvHL40etHGj2vuVzpllYSmjlHg+4fQR38rFSpe6isA/BduZef4+h01t3/gzipYeFOdhKggVxnH+Os9I8eb9xcQhSoXU7hnHWxOebO7sIzM2i2T4oRvkcAPYTUYtfVgaErVJnEM4BulVOV+EDaRMAPwf/DvyGcVv8UeKBhFftcXMZ2J1+wdK1SF7/tCOIH7qy4gJze7ZqXMdqwpRd8R8IEH8huLKFXdE2IN/WGAv4fX7yzb/CCiKdKcRNxYeMlvDlGoumCU6V2hPSL/guBBrFI1ShkJi3Emf4fCU+ilvnnVw8+vaZeX+n5HWCN2gdJGdFYGNsluzyjiGx87SfsQxTQ7vNw893x9C8DRQI23rishS7OCsLHEKlW5poJHmfztG2MNfb9hqe8Ay9bQQzhIsDl91Rml9pA7bdm3kxnrAEDoYYp5lggJVSz6joCwGnRoJX2QfIW4U1O3UuySt+GR6rrZ9jmDvr+s9oQSW0OfIV4BOrt+Z9meFeflT5H+GXJteB1n8jeHoj9Be8X0AjovT+C3mX6K9asHLg4QNxv4PRHN6uy5CZ0yVAOsi74jIFRyiGEOilr3e18h/jSWOeKfiiQm4gfACXQHfwB90W1l/n5+TWPEdyY204rf5i39REabM8mVnxb3VxaO521k8gW0mYygSup5s/vawPv+2hytfkhExaaPjjtggebB9y0pA8HiDM3t2Ghd5eUa4jWz/cR7GoY4yonhCGwNvWapb8QXH9dZQw/huGJz+gTtj/3n3D+x5XkvVAjTyO8WjuexCuCPbMBVjrc3wMpwioHZUUYTIIJm4Xph0099CUssHM/X9jTpNcQf09xBIkUo8AqVQaOUKjysoacyejat+C1FJ5VbGUimQLNiP438vHA8j5HJ47qDCJ5sxObrgH1Ux3AfKNhC9/eIbRqFxzvrstogtKdwPM8xuB4E11pOwT3k6ftoeLQaYjpg5eCLjxfQ6Uy1efxRy/v9migS+NHEXsJR7T7i8jT5/ZVM0fL7TTlpOIdbVi+gO+oJ3PeC3iKieftoCVV49hPTzNEQVofC4531VKr474sWfhzEapyWUcW1xLKG/hfSzsRdoDQjFXG/XxNdjPoP2i4fs2IWq5DnSuMi9sO2A5RVgYj24XclzVgpdR5gGPTepuRhT7j6iS0uW2HDYSXcNRC6t47L9kapmrfwYwvAf3mWxBuufAXW8Nh/pDX0EKru9ztAmrzMNYNT5hZaLFWyQt5GMZq3+LaJUYtv175DYkX4icerP9t70gIuXj5g2eiaTVi29alvM7EfJjA+8jLPHYmuuQYAfOS/7ebkh0S0IKJpU6UiogkRFdAN69opVBa5Osi6+/1CL6Oto0uDofeIaB7aCHN6C7QwQ5FxE/k05iNeulrrpT9rH5WLF1V3YfJvztkS9GMYdK3LDgB4r6Br9mELa9hRClH49CV76za7aRv/nCXwbwfaGvhHIiq4w5zx34KIzqEvBl7rS2l5FinX8tKs4rdUitAFum8Q7wEofPZYEdE2z4j+hXYK+czzvZiBxk7I3h5O0xHSHV4YMgXc5XaGZsV0Cne59GIYdENmaHzamu+72t/Gfcta7s1ZdXjg6nNrxZMulu25rS1yLzl+Uap4FHKa0O896I7iIf/dw3rPTJWZZfCz6n6/lNeo1NrVyswtAH+xwE/t5RuuCBMiOkD4fYhVnAWczoudzbrHaRnXvcDp2odOU6pZxsHC5ecjp5MmGQzYX/V96JYEBwuPdzahcz+Ae7YK4FnoXJEoDUbmPS35Cm5mnu/9nlOxYvk4gdZDss5kl6+pmeYKaNPgk3mPEnpZd7/fLJH/Z+j/rsA96JnOv4lIEZEC8BF6dvMnpFHKpwHvtplt3INWFM9ZwTqwZ22h07XuS+AAvthO87Hw/6PPsiy/47O/6mHCU6YLj3emicIaLKzU+i7XmMHFKGUcrANOZjCyBT3bvQkzhSsF74U89Hz9d24nk5Yjtz8FLg+L3ULGw1hLShU3Vj/mCmwDOUA6Q5q57/ervJdwzXgaaEIkRcXbglawfsLyrO1GwB3g3OPVwxD7Xp77q4B0hkELj3f2Qkfbq3j6icvJZ1kH0LJ+wgOKtqd9t3nG829cnfUUxWq47MNvdhPQ7eRJilkrIhrxAPa/uNpP7uWaSb1yoTJXGF/NUmiAlaAUSwJV9/vtov39fobDpvsJ14RTBM7qsZIpdSES7uDmcCv+sffGTeEetCQxDOp5RBzQo21nWiwF4WRFFYEJ/AeMW9ADigXPRAQt1RHRmDvABZrbvFuQTfKDI2DJ3rADXY8WRLQfMvDgejXlpWHX6ft7OTbJf1X1o1JqSkRAP5tnzb6utThNc/2OOvn8mn6EXtaKZVrxW6qlulOlVJX/68QFgGnkTNwMaS5W3kR89lFFl41S6pyn9v92vHqLiOYJ5Nz3QIHZeDsHcGJmR1mZ2IW+VNyWqSn6X3oPwsr7Av51YwtaKfqJiC74W7PcW/DfbVxeYTLmf4fUve+JaL/q9KjQH0qpgii4H9yB3iLxhIjOoGVkAX1fsZGbETsjN6GrAE9I3x2a7DR4pVIFfFGszpFuNsSHU+iKtFazJtfvqPnn19EzS7nu9wMu83uduYA2IhlVaZRSC97w7GNbSWDI/6Lk/TYNmlLqhIh+hrt87nHjOY8NC1rB9h1o3jJx4gFqE/tYMaUK+JL3Y8SZN9mC3hNl9kWlulXjFDJbNUiUUnOuCzETDDvIM8lzmNq8zpXlPxul1D70Hivf9dA2HIItKGMNDeldv6P2EbeUNLX/w0sFKRrgU1zmd5c8RdpTpk20UqgMPOrtahkw52XWncAzMj4N59OWSg6AoP1Vv7c5JcZGcZ/Gft/AzqqaBeC6NUY3fYSLvto0wROu70PZt32YY5WmUakCvmTCLvw3JoZyAeDfSil7CSBk6W9lKtD1O2oKv1NLhiv3+0GPatteedNn43MO3QjnVqySKFQGrny5FStz193KEmDg85QHbamYwk8hbXuceoY8sruyBhC5jo2Qr4/wwR6UCwOGdYpv0O8A8udc216cShWgR2hKqTGAb5Gu4lxAmxwY2ZukI0aSSafucnP9jjoA8G+4R3a57vd7qpTa7bPx4bDHyNcIn0LLVVLZ4EqYY6YCSKwE9sgR/C9KTkbAZtgdtNheYMluasVqb5VtLfEdjWN0t7JhqBqUCwOH27ldpDU75MMpgG9y7rnzUqoMSqmCK8430J1LjKZ5Cj1bM1JKzSoqwjjCz5Xi+h11BD2ya1qySH2/3xl04zOIEbHVCKe25fUop9LI+fct0o6yjpFBCewa3nvms9dvmuN+yQD7VXttDINailWbi+jLvECLy7iHAs9CjKDrdU7lqnJQLqwO3AfMAHyN/KsAZ9B28Hazt7NKqVYOugJNoKfFZ9CbFm1nfh8D2Pbw7wSACnCTwPiOA/03btw2r6rcp1cYf3qF4tMrKMsVCeN9zvnvzPuIsi8i4jOr8Gc30i/bzaEb2ORlVJP2bc7XRYs4L6AVjLLfof5ckRdH3GepwwiQzyvln6FsjjzjEtR21IQ1aSkDBTzbFs9y8/KrwzoyRXib3uROoGfrk7RnnnLbSZ4Ooe5wPApXXDKFO0L7NrXsjlDRxuZ0taf/fFF6xLlAghN7fJIk1JTCIvD9c8QtO2WZ+eCTfePPr2kM3QAZBbVM6HSlOQUzV/mmxWM0/kX5B8WbXa3lzQn89o0dQ8tdzjRWwuHNAMx4k/EEuoH2ifcLAEeqfpN2qHyGlsMiQxj7Hn4ulFq2t5aJKbTsu/ZOTdGy3VJ6luSI2y4jA6427Bi64zpSYaPmBdx5PJglMK4jc+hrZEbQeTOG7jz3PL05hZa9E+j8WiSNpF9/0FWeOutPF5FAT1tquGxn0G2qMT0yhpYXX73gGMvy0nl9INYQBwERnSBMqbpQSq3dScEyfDz9d8drZ9CCVCBP49MpvJl4F5d2SAwFAKgwy+idYcXb/DWcADgfaryFtHCnUG6bFqteL1PTcI2Q5JWwhNW2VnHShwJVhVOpIqJxFx0B73F4GPjZC6XUSp+W8sEhTOeBo11BEARBEDLQuPxnFB0iepRz2p5nYkIVKmDNjITWwRp40Xc8BEEQBEGop3amimdHFrg8bXYGveGrSBb4pSHLe5Fe3BjKlJ8gCIIgCJtNk0mFfSwf398B8BcRFSms//Ls1AniFapDUagEQRAEQRgKlTNVFbNUVZxBL78d+c5e8ebNKfxPdzXxjewlEgRBEARhKNQpVTOE73E6xvLt0QZzCsb3CK0PWe7sEQRBEARBiOWKUuU5S9UnFwB25bitIAiCIAhDompPVXkv1dCYiUIlCIIgCMLQWJqpWoFZqo2wSyUIgiAIwupRnqka8izVKfQmd0EQBEEQhMFRnqlaoP2pvBycQl9qKSYUBEEQBEEYJOWZqgm0AjMkDiEKlSBUQkRviEgR0e2+49IlRHSX0/2877gIm8Om1jfBnyWlSil1opTaBfAI+pRdn1wA+FEpNRWFSnBBRDeI6AMRves7LoIgbDZE9JiVrwd9x0XolkqL6nzP3wh6lqgPXkCbTZj3FL6wxhDRTW7w7gZ8c5+/uZEzbkNgk9KaEiJ6R0SPA94PlkNh/ZD6tl7UXlOjlDpnA5s3oGeuzjqIzzGAb5VSEzGbIISglPqolPqHUup/PF7/LiKITZru36S0JoGIbgK4GfhZjBwKK4BS6helFCmlfvV4XerbGtF09x+AL8rVTCk1AvAtgKdIq2BdsJ9fK6XGKS9sFoQaYhqxTeoANymtqRBFXYhF6tsa4VSqbJRShVJqnxWsrwH8CL1EeBzgzRm//wj6/r5t9nMREpd1gKd9X/LUr3Eviei+x7c3iehZzLeWH2/MHiQiesDLF7Zfd613H1eE5ewUeK+TIqJnNf4851G+SdPz0vNnPtPiVjgfHO89BmDyyA7rTc37N3kztJmF+GB941zqqSjjD6H7LIjodmy+BIbTNq2tZTKCjw1yEzRzVFEH3njWxQcATJk+KMWjsoxC5bD07Y3Y+sjf2/X+dkk+ky1FVsj+OyP7/HtjXeX3PrjykQL2LpE+4FCWlZcp0+0br9D6RpfLhC8b/Lxt8rp9KoQolFJJHYBxjdtNHdYqOwCPAaga98Dx7d2GbxWA555xeAPgA4BnDX7d5feqnn0AcMMRxg1+92WDP+84nA81z994pMWE86HhnQcN6awMA8Dzhm8etyjjl55l9F2DH++sPL2dQCbbpDWJTAbE1YT3skFuPgC46enfy5i0Q882NaX7Sv2IkUPr25tc7rX1NaDeV8lWaznySONzTkNtXbX8MWVb2c5YdayxzfSIU0jeOfPJJ14x9c3Kj0q5ttL4LGV9E+fveo/AJrpSB/Sg9OxBU0cArTyYivXcbmz42w9V/tb4ZSs5z6zfb+KqAvTAen7bathdCuANy48PJX/KitQ7APet5/etZ995huPTUJvGzNmIWt80Nu4NZVxO820rbxsVFX7f5PNLWy5KZZ2sM4xMazKZjKxDb+yy5Dw2SpKPQv64xp/7VtwbZcXqzJxl2lIOjeyU5cGkwWeg88Z6901I+J5xtBXN56Vn9gCua6XKyEW5zTWy4hzoIKFS5ZvGEH+t9qKxvRSXz/UegU10VsUM7mSsSlU58selIvIuIB5X/MLyKPZKR2GF09gQYVmpupJeLI8erzTuViPsq7wNRal62ZAm0+k0lpGrLEt516dSlUwmA+J4tyntWFb0XB3gB9QoI1YeN860oQOlyqqTrllVV10x9f6dbxkHls2zpjyz4tmpUtUQxs2A+PStVJm244oM+LYr4vK6oD1VQnt4b8BtAB+V38mQMmbt/7eqh0qp3wC8B3DTd48FgD8rfntr/bsqLPM8ZF/PHxW/vTd/lVJNz1fmuDGX8XeoSZNS6i2Aj9Bl1LTvx5RfXVn/yv70TQ6Z9OU952c5zI+4lLfajcC8l+YGgD/4mzKmbgxhU7lJR2U+47JO+u4l+60mzW1xxbPu915QSr3HMOqRE5b1twBuV9QlV74LHSBKVfeYBu9941v1GOXiSkdiEdq4NvkFpGlwPnLjlTOMoWDy/WZpQ+wXh8tybFIWzbOh51sOmfSlKUwfhdzE535NOZmN45rEveMAAAQqSURBVENQ6k1cy4cBTFzN5mbfuFYNplLgkofYtq81vNn7sbUBvlwfVwEzWChvrjcHH3KVq+CBKFXdE92p8AxISOVP3YEJfoTke9O7Pv70qlStgUz6xv1G6tOWEfjmXW957CkPncssn5h8Cb00+QCrpUSV+Q06D+3T2behy/1t1cyt0B2iVHVP9CiNp+pDGqTeRoQbjimjt0obAGxyVUuehsGX3xrIpIn7rx5l1fesoAn/B0c8/9lXBCPkoSueQS+PfQTwK4D/MfkF4B+9xiwQzuM/oWfCzZKf+dvUnggdIEpV95gGJ3Y0aTqlpj0e5tnQOrBNweR72xkDH1kZwsxPnzLZFKbJm6ZO3jwbwp4pF6nkKjeuPE2Z175+GaXjB6Wtna9621heArxf+l3oCVGqOoYr81vo5YSYyzZNpan8lo0V3kTNBl5hiZglAOc3CcrYYMqv0gCltck6F75+9ymTlZvfeRnKdDhNe0z+gFYCvrNG/W3IIlOMScf9ASxFNvElnjXPQ/K5VkHjQx6hClqVMpXTOG0I3mXKM9zvoeXWLP39uQbK4sojSlU/mNMZj8udLlt1brLua05SfceWgL9URPbrWSkM4SqmoQ7pnMw3vhfmmpOdj6lk/dyyiN2ocJVOzb20TwqWyjo1oWntWyaf25bPuZN5Cd1JNe4x4aUUE6/nFfXxNpeVy+K2ybO7ASccg+SQO9K30B3oFUv11ibsvmfdTH7eJb5JwcD/DxlomLJbShen/Tn8FRGT1+X4PIa/nOcitL4Z/oCWhcfW/4W+6dumw6Y6NFvbdlmvvo16K9JOmzqWP7U2V7BsX6rKfk+tvZQafyptwODS3lCd7R0v+z+ucGribrvG74BKa8y+touiywlui+rGHlZKO1UxaU0ikwFxNHLzrCHcd0hjUd3X3lCVpfPacomUwyrDvN5hsh/JrPBHyr6xgu9TV282lK99G4TLNtd9R3x8LbznsFMVXN+svLHzIrnNMXHhTmaqekIp9QuA/+Dq0oQZjTZ9+xbAP3F15P8ngP8opX5IFc91hPPvByznsyvPfwXwC5b35/h88wOujiDNZtlfPOL6J3RZl+XkN/49+RJvZFr7ksk/ONxyHv8G4J/KczlEKfUv6DSX8/kt9CZ2H5ty/yp9/x4Ne8gi5fC90hvRf63w+08Av6gBLPtzfv0Hy+l5D53HP8BzhonLr5yvgC7vqt/r/PmtIj4fofPL258cxNQ3/u49LuP9p+r/IIUAgFjjFQRBEITs8FLnB2jbdSt18m5okL6A+zb0BnxZ/hsAMlMlCIIgCCsG7zEzt3OIQjUQRKkSBEEQhNVDzCgMEFGqBEEQBGGF4FOqRqmSk94D4qu+IyAIgiAIQjOsSJXNLgziYIJwiShVgiAIgrBafIT/qVShQ+T0nyAIgiAIQgL+H0heAe6Bx3eGAAAAAElFTkSuQmCC';
var STATUS_DEFAULT_SEED = [
  { name: 'Not Started', type: 'todo', color: 'neutral' },
  { name: 'In Progress', type: 'progress', color: 'info' },
  { name: 'Pending', type: 'pending', color: 'crit' },
  { name: 'Done', type: 'done', color: 'ok' }
];
// statuses from older versions of the site → their replacement in the 4-status set
var STATUS_MIGRATE = { 'Pending Approval': 'Pending', 'Blocked': 'Pending' };
var SETTINGS_DEFAULT = {
  siteTitle: 'GX27 Operations',
  siteSubtitle: 'Festival of Connectivity · 21 Nov 2026',
  eventName: 'GX 27 Festival of Connectivity',
  eventDate: EVENT_DATE,
  prepDeadlines: PREP_DEADLINES.slice(),
  timelineSubtitle: 'Pre-event programs hingga Festival of Connectivity · Oktober–November 2026',
  timelineTagline: 'One journey · Four programs · One celebration',
  logoUrl: '',
  budgetSheetUrl: '',
  taskStatuses: JSON.parse(JSON.stringify(STATUS_DEFAULT_SEED)),
  taskCategories: ['Program Milestone','Preparation','Procurement','Production','Coordination','Event Day'],
  workstreams: ['GX Connect','GX Got Talent','Mobile Legends','HYROX','Event Day','Preparation','Design & Production','Games & Competition','Entertainment','Tenants','Doorprize',"Winners' Prizes",'Procurement','Emergency Fund'],
  rundownTitle: '',
  pics: ['Putri', 'Esi', 'Pak Atong'],
  autoSave: true,      // admin panel saves every change to the database automatically
  autoPublish: true    // changes saved by an admin go live right away
};
// 'local'  = no database configured: edits stay in this browser (original behaviour)
// 'public' = visitors: read-only view of the published content
// 'admin'  = /admin: signed-in editors/admins edit the draft, Save + Publish
var MODE = 'local';
function canEdit() { return MODE === 'local' || (MODE === 'admin' && !!window.GX27Admin && window.GX27Admin.canEdit()); }
/* ---------- Columns (Tasks & Finance tables): rename, hide/delete, add custom, reorder ----------
   settings.columns = { tasks: [col], finance: [col] }, col = { key, label, visible, custom?, type?, options? }
   Built-in columns can be renamed, moved and removed (removing only hides them; data stays and they can be restored).
   Custom columns store their values in record.cf[<key>]. */
var COL_BUILTIN = {
  tasks: [
    { key: 'name', label: 'Task', locked: true }, { key: 'workstream', label: 'Workstream' }, { key: 'category', label: 'Category' },
    { key: 'start', label: 'Start', hidden: true }, { key: 'deadline', label: 'Deadline' }, { key: 'pic', label: 'PIC' }, { key: 'status', label: 'Status' },
    { key: 'notes', label: 'Notes', hidden: true }, { key: 'source', label: 'Data Source', hidden: true },
    { key: 'payment', label: 'Payment' }
  ],
  finance: [
    { key: 'item', label: 'Item', locked: true }, { key: 'qty', label: 'Qty', num: true, hidden: true }, { key: 'unitCost', label: 'Harga', num: true, hidden: true }, { key: 'est', label: 'Budget', num: true, total: 'est' },
    { key: 'invoice', label: 'Invoice', num: true, total: 'inv', hidden: true }, { key: 'dp', label: 'DP', num: true, hidden: true }, { key: 'paid', label: 'Dibayar', num: true, total: 'paid' }, { key: 'remaining', label: 'Sisa', num: true, total: 'outstanding' },
    { key: 'paymentDeadline', label: 'Due Date' }, { key: 'invoiceStatus', label: 'Status Invoice', hidden: true }, { key: 'paymentStatus', label: 'Status Payment' }, { key: 'receipt', label: 'Bukti TF', hidden: true },
    { key: 'task', label: 'Task' }, { key: 'check', label: 'Cek', hidden: true }
  ]
};
var COL_TYPES = [{ value: 'text', label: 'Teks' }, { value: 'number', label: 'Angka' }, { value: 'money', label: 'Rupiah' }, { value: 'date', label: 'Tanggal' }, { value: 'select', label: 'Pilihan (Dropdown)' }, { value: 'checkbox', label: 'Centang' }, { value: 'link', label: 'Link' }];
var COL_TABLES = { tasks: 'Tasks', finance: 'Finance' };
function builtinCol(table, key) { return COL_BUILTIN[table].filter(function (c) { return c.key === key; })[0] || null; }
var COL_LABEL_V9 = { 'Data source': 'Data Source', 'Due date': 'Due Date', 'Status invoice': 'Status Invoice', 'Status payment': 'Status Payment', 'Linked task': 'Task', 'Pay deadline': 'Due Date' };
function normalizeColumns(s) {
  var c = s.columns && typeof s.columns === 'object' ? s.columns : {};
  var out = {};
  Object.keys(COL_BUILTIN).forEach(function (table) {
    var seen = {}, list = [];
    (Array.isArray(c[table]) ? c[table] : []).forEach(function (col) {
      if (!col || !col.key || seen[col.key]) return;
      var b = builtinCol(table, col.key);
      if (!b && !col.custom) return;
      seen[col.key] = 1;
      var lbl = String(col.label || (b && b.label) || col.key);
      if (b && COL_LABEL_V9[lbl]) lbl = COL_LABEL_V9[lbl];   // old default labels → consistent capitalization
      var x = { key: String(col.key), label: lbl.slice(0, 60), visible: col.visible !== false };
      if (b && b.locked) x.visible = true;
      if (!b) { x.custom = true; x.type = COL_TYPES.some(function (t) { return t.value === col.type; }) ? col.type : 'text'; x.options = Array.isArray(col.options) ? col.options.map(String).filter(Boolean) : []; }
      list.push(x);
    });
    // built-ins missing from saved settings (first run, or added in a later version) are added at their default spot
    COL_BUILTIN[table].forEach(function (b, i) {
      if (seen[b.key]) return;
      var x = { key: b.key, label: b.label, visible: !b.hidden }, at = list.length;
      for (var j = i - 1; j >= 0; j--) { var k = list.map(function (y) { return y.key; }).indexOf(COL_BUILTIN[table][j].key); if (k > -1) { at = k + 1; break; } }
      if (i === 0) at = 0;
      list.splice(at, 0, x);
    });
    out[table] = list;
  });
  s.columns = out;
}
function colList(table) { return (db.settings.columns || {})[table] || []; }
function visibleCols(table) { return colList(table).filter(function (c) { return c.visible; }); }
function customCols(table) { return colList(table).filter(function (c) { return c.custom; }); }
function cfVal(r, key) { return r && r.cf ? r.cf[key] : undefined; }
function cfDisplay(col, v) {
  if (v == null || v === '') return '<span class="faint">—</span>';
  if (col.type === 'checkbox') return v ? '✓' : '<span class="faint">—</span>';
  if (col.type === 'money') return rp(+v);
  if (col.type === 'number') return esc(String(v));
  if (col.type === 'date') return /^\d{4}-\d{2}-\d{2}$/.test(v) ? fmtDate(v, true) : esc(v);
  if (col.type === 'link') return /^https?:\/\//.test(v) ? '<a href="' + esc(v) + '" target="_blank" rel="noopener">' + esc(v.replace(/^https?:\/\//, '').slice(0, 28)) + '</a>' : esc(v);
  return esc(String(v));
}
// a custom cell; editable in place when the visitor can edit
function cfCell(table, col, r) {
  var v = cfVal(r, col.key), a = ' data-inline="cf" data-table="' + table + '" data-col="' + esc(col.key) + '" data-id="' + esc(r.id) + '" aria-label="' + esc(col.label) + '"';
  if (!canEdit()) return '<td' + (col.type === 'number' || col.type === 'money' ? ' class="num r"' : '') + '>' + cfDisplay(col, v) + '</td>';
  if (col.type === 'checkbox') return '<td><input type="checkbox" class="cf-check"' + a + (v ? ' checked' : '') + '></td>';
  if (col.type === 'select') return '<td><select class="inline-select"' + a + '>' + opts(withCurrent(col.options, v || ''), v || '', '—') + '</select></td>';
  var type = col.type === 'date' ? 'date' : col.type === 'link' ? 'url' : 'text';
  var val = col.type === 'money' && v != null && v !== '' ? rpFmt.format(v) : (v == null ? '' : v);
  return '<td' + (col.type === 'number' || col.type === 'money' ? ' class="num r"' : '') + '><input class="cf-input' + (col.type === 'number' || col.type === 'money' ? ' r' : '') + '" type="' + type + '"' + a + ' value="' + esc(val) + '"' + (col.type === 'number' || col.type === 'money' ? ' inputmode="decimal"' : '') + '></td>';
}
function parseCf(col, raw) {
  if (col.type === 'checkbox') return { ok: true, value: !!raw };
  raw = raw == null ? '' : String(raw).trim();
  if (raw === '') return { ok: true, value: null };
  if (col.type === 'money') { var p = parseAmount(raw); return p.ok ? p : { ok: false, msg: 'Isi nominal, contoh 1.500.000' }; }
  if (col.type === 'number') { var n = Number(raw.replace(',', '.')); return isNaN(n) ? { ok: false, msg: 'Isi angka.' } : { ok: true, value: n }; }
  if (col.type === 'date') { var d = parseFlexDate(raw); return d ? { ok: true, value: d } : { ok: false, msg: 'Tanggal tidak dikenali.' }; }
  return { ok: true, value: raw.slice(0, 500) };
}
// form fields for custom columns (task & budget forms)
function cfFields(table, r) {
  var list = customCols(table);
  if (!list.length) return '';
  return '<div class="field full cf-sep"><span class="hint">Kolom Tambahan</span></div>' + list.map(function (col) {
    var v = cfVal(r, col.key), name = 'cf__' + col.key, inputHtml;
    if (col.type === 'checkbox') inputHtml = '<label class="cf-cb"><input type="checkbox" id="f-' + name + '" name="' + name + '" value="1"' + (v ? ' checked' : '') + '> Ya</label>';
    else if (col.type === 'select') inputHtml = sel(name, withCurrent(col.options, v || ''), v || '', '—');
    else inputHtml = inp(name, col.type === 'money' && v != null ? rpFmt.format(v) : v, col.type === 'date' ? 'date' : col.type === 'link' ? 'url' : 'text', col.type === 'number' || col.type === 'money' ? 'inputmode="decimal"' : 'maxlength="500"');
    return field(name, esc(col.label), inputHtml);
  }).join('');
}
// pulls cf__* keys out of a form-values object into a cf object; returns errors keyed by field name
function takeCf(table, v, current) {
  var cf = Object.assign({}, current || {}), errs = {};
  customCols(table).forEach(function (col) {
    var name = 'cf__' + col.key, raw = col.type === 'checkbox' ? (name in v) : v[name];
    var p = parseCf(col, raw);
    if (!p.ok) errs[name] = p.msg; else if (p.value == null || p.value === false) delete cf[col.key]; else cf[col.key] = p.value;
  });
  Object.keys(v).forEach(function (k) { if (k.indexOf('cf__') === 0) delete v[k]; });
  return { cf: cf, errs: errs };
}
function columnManager(table) {
  table = table || 'tasks';
  var list = colList(table);
  var rows = list.map(function (c, i) {
    var b = builtinCol(table, c.key), locked = b && b.locked;
    return '<div class="col-row' + (c.visible ? '' : ' off') + '" data-ri="' + i + '">' + DRAG_GRIP +
      '<label class="col-vis" title="Tampilkan di tabel"><input type="checkbox" data-col-vis="' + i + '"' + (c.visible ? ' checked' : '') + (locked ? ' disabled' : '') + '></label>' +
      '<input class="input" id="col-' + i + '" data-col-idx="' + i + '" value="' + esc(c.label) + '" maxlength="60" aria-label="Nama kolom">' +
      '<span class="col-type">' + (c.custom ? esc((COL_TYPES.filter(function (t) { return t.value === c.type; })[0] || {}).label || c.type) + (c.type === 'select' ? '<input class="input" id="colopt-' + i + '" value="' + esc((c.options || []).join(', ')) + '" placeholder="Pilihan, pisahkan koma" aria-label="Pilihan dropdown">' : '') : (b ? 'Bawaan' : '')) + '</span>' +
      '<span class="st-btns"><button class="btn sm" type="button" data-act="col-move" data-table="' + table + '" data-idx="' + i + '" data-dir="-1" aria-label="Geser ke kiri"' + (i === 0 ? ' disabled' : '') + '>↑</button>' +
      '<button class="btn sm" type="button" data-act="col-move" data-table="' + table + '" data-idx="' + i + '" data-dir="1" aria-label="Geser ke kanan"' + (i === list.length - 1 ? ' disabled' : '') + '>↓</button>' +
      (locked ? '<span class="col-lock">wajib</span>' : '<button class="btn sm danger" type="button" data-act="col-delete" data-table="' + table + '" data-idx="' + i + '">Hapus</button>') + '</span></div>';
  }).join('');
  var hidden = list.filter(function (c) { return !c.custom && !c.visible; });
  openModal('<form id="colForm" novalidate><div class="modal-h"><h3>Manage Columns</h3><button type="button" class="btn ghost sm" data-act="modal-cancel" aria-label="Close">✕</button></div>' +
    '<div class="tabs" role="tablist" style="margin:0 20px">' + Object.keys(COL_TABLES).map(function (k) { return '<button type="button" role="tab" data-act="col-tab" data-table="' + k + '" aria-selected="' + (k === table) + '">' + COL_TABLES[k] + '</button>'; }).join('') + '</div>' +
    '<div class="modal-b one"><p class="muted" style="margin:0">Urutan dari atas ke bawah = urutan kolom dari kiri ke kanan (drag ⋮⋮ atau pakai ↑↓ untuk ubah urutan). Centang = tampil di tabel. Ganti nama langsung di kotaknya. Kolom bawaan yang dihapus hanya disembunyikan (datanya tetap ada, bisa dikembalikan). Kolom tambahan yang dihapus ikut menghapus isinya.</p>' +
    '<div class="cat-list" data-reorder="col:' + table + '">' + rows + '</div>' +
    (hidden.length ? '<div class="col-restore"><span class="muted">Kolom bawaan tersembunyi:</span> ' + hidden.map(function (c) { return '<button type="button" class="btn sm" data-act="col-show" data-table="' + table + '" data-key="' + esc(c.key) + '">+ ' + esc(c.label) + '</button>'; }).join(' ') + '</div>' : '') +
    '<div class="col-add"><input class="input" id="colNew" placeholder="Nama kolom baru, mis. Vendor, Lokasi, Link file" maxlength="60"><select class="select" id="colNewType" aria-label="Tipe kolom">' + opts(COL_TYPES, 'text') + '</select>' +
    '<input class="input" id="colNewOpts" placeholder="Pilihan dropdown, pisahkan koma" hidden><button type="button" class="btn" data-act="col-add" data-table="' + table + '">+ Tambah Kolom</button></div>' +
    '<div class="form-err" id="catErr" hidden></div></div>' +
    '<div class="modal-f"><div class="right"><button type="button" class="btn" data-act="modal-cancel">Tutup</button><button type="submit" class="btn primary">Simpan</button></div></div></form>', 'wide');
  var form = document.getElementById('colForm');
  var ty = document.getElementById('colNewType'), op = document.getElementById('colNewOpts');
  if (ty) ty.addEventListener('change', function () { op.hidden = ty.value !== 'select'; });
  var nw = document.getElementById('colNew'); if (nw) nw.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); colAdd(table); } });
  form.onsubmit = function (e) { e.preventDefault(); if (colApply(table)) { closeModal(); commit('Kolom disimpan'); } };
}
// reads names / visibility / dropdown options from the open dialog into settings; false if invalid
function colApply(table) {
  var list = colList(table), names = [];
  for (var i = 0; i < list.length; i++) {
    var el = document.getElementById('col-' + i); if (!el) continue;
    var nm = el.value.trim();
    if (!nm) { catErr('Nama kolom tidak boleh kosong.'); el.focus(); return false; }
    if (names.indexOf(nm.toLowerCase()) > -1) { catErr('Nama kolom "' + nm + '" dipakai dua kali.'); el.focus(); return false; }
    names.push(nm.toLowerCase());
  }
  list.forEach(function (c, i) {
    var el = document.getElementById('col-' + i), vis = document.querySelector('[data-col-vis="' + i + '"]'), op = document.getElementById('colopt-' + i);
    if (el) c.label = el.value.trim();
    if (vis && !vis.disabled) c.visible = vis.checked;
    if (op) c.options = op.value.split(',').map(function (x) { return x.trim(); }).filter(function (x, j, a) { return x && a.indexOf(x) === j; });
  });
  return true;
}
function colAdd(table) {
  if (!colApply(table)) return;
  var nm = (document.getElementById('colNew').value || '').trim(), type = document.getElementById('colNewType').value;
  if (!nm) { catErr('Isi nama kolom dulu.'); return; }
  if (colList(table).some(function (c) { return c.label.toLowerCase() === nm.toLowerCase(); })) { catErr('Kolom "' + nm + '" sudah ada.'); return; }
  var options = type === 'select' ? (document.getElementById('colNewOpts').value || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean) : [];
  if (type === 'select' && !options.length) { catErr('Isi pilihan dropdown, pisahkan dengan koma.'); return; }
  var key = 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  colList(table).push({ key: key, label: nm, visible: true, custom: true, type: type, options: options });
  persist(db); render(); columnManager(table); toast('Kolom "' + nm + '" ditambahkan');
}
function colDelete(table, idx) {
  var list = colList(table), c = list[idx]; if (!c) return;
  if (!c.custom) { c.visible = false; persist(db); render(); columnManager(table); toast('Kolom "' + c.label + '" disembunyikan · bisa dikembalikan di bawah'); return; }
  var rows = table === 'tasks' ? db.tasks : db.finance, used = rows.filter(function (r) { var v = cfVal(r, c.key); return v != null && v !== '' && v !== false; }).length;
  closeModal();
  confirmDialog('Hapus kolom "' + c.label + '"?', used ? 'Isi kolom ini di ' + used + ' baris ikut terhapus. Versi sebelumnya tetap ada di Version history (admin).' : 'Kolom ini belum berisi data.', 'Hapus kolom', function () {
    list.splice(idx, 1);
    rows.forEach(function (r) { if (r.cf && c.key in r.cf) { delete r.cf[c.key]; r.updatedAt = Date.now(); } });
    commit('Kolom "' + c.label + '" dihapus');
  });
}
var DRAG_GRIP = '<span class="drag-h" title="Drag untuk ubah urutan" aria-hidden="true"><svg viewBox="0 0 10 16" width="10" height="16"><g fill="currentColor"><circle cx="3" cy="3" r="1.3"/><circle cx="7" cy="3" r="1.3"/><circle cx="3" cy="8" r="1.3"/><circle cx="7" cy="8" r="1.3"/><circle cx="3" cy="13" r="1.3"/><circle cx="7" cy="13" r="1.3"/></g></svg></span>';
/* v11: drag & drop urutan di Manage Columns / Manage Categories */
var REORDER_HOOKS = {};   // add-ons (needs.js) register their own lists: data-reorder="hook:<name>"
function listReorder(spec, from, to) {
  if (from === to || from < 0 || to < 0) return;
  var p = spec.split(':'), kind = p[0], name = p[1];
  if (kind === 'hook') { if (REORDER_HOOKS[name]) REORDER_HOOKS[name](from, to); return; }
  if (kind === 'col') {
    if (!colApply(name)) return;
    var cl = colList(name); if (to >= cl.length) return;
    cl.splice(to, 0, cl.splice(from, 1)[0]);
    persist(db); render(); columnManager(name); return;
  }
  var K = CAT_KINDS[name], li = db.settings[K.key]; if (!li || to >= li.length) return;
  li.splice(to, 0, li.splice(from, 1)[0]);
  persist(db); render(); closeModal(); categoryManager(name);
}
var rdDrag = null;
document.addEventListener('pointerdown', function (e) {
  var g = e.target.closest && e.target.closest('.drag-h'); if (!g || (e.button && e.button !== 0)) return;
  var row = g.closest('[data-ri]'), list = row && row.closest('[data-reorder]'); if (!list) return;
  e.preventDefault();
  if (!canEdit()) { toast('Hanya admin yang bisa mengubah data.', true); return; }
  rdDrag = { row: row, list: list, from: +row.dataset.ri };
  try { g.setPointerCapture(e.pointerId); } catch (er) {}
  row.classList.add('dragging'); document.body.classList.add('rd-dragging');
});
document.addEventListener('pointermove', function (e) {
  if (!rdDrag) return;
  var d = rdDrag, rows = [].slice.call(d.list.querySelectorAll(':scope > [data-ri]'));
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i]; if (r === d.row) continue;
    var b = r.getBoundingClientRect();
    if (e.clientY >= b.top && e.clientY <= b.bottom) {
      if (e.clientY < b.top + b.height / 2) d.list.insertBefore(d.row, r); else d.list.insertBefore(d.row, r.nextSibling);
      break;
    }
  }
  var lb = d.list.getBoundingClientRect();
  if (e.clientY < lb.top + 24) d.list.scrollTop -= 8; else if (e.clientY > lb.bottom - 24) d.list.scrollTop += 8;
});
function rdEnd() {
  if (!rdDrag) return;
  var d = rdDrag; rdDrag = null;
  d.row.classList.remove('dragging'); document.body.classList.remove('rd-dragging');
  var to = [].slice.call(d.list.querySelectorAll(':scope > [data-ri]')).indexOf(d.row);
  if (to !== d.from) listReorder(d.list.getAttribute('data-reorder'), d.from, to);
}
document.addEventListener('pointerup', rdEnd);
document.addEventListener('pointercancel', rdEnd);
function colMove(table, idx, dir) {
  if (!colApply(table)) return;
  var list = colList(table), to = idx + dir;
  if (to < 0 || to >= list.length) return;
  var t = list[idx]; list[idx] = list[to]; list[to] = t;
  persist(db); render(); columnManager(table);
}

/* ---------- Timeline update 12 Oct 2026 (from the team's "Timeline Persiapan & Operasional") ----------
   Applied once to the shared data (flag timelineV3). Existing tasks keep their id (so budget links stay),
   new tasks get fixed ids so two devices applying it at the same time never create duplicates.
   Status is only changed where the timeline says so (✅ = Done, "tunggu …" = Pending). */
var TL3 = [
  // [id (existing or new), deadline, workstream, category, name, status|null, waitingOn, notes]
  ['T030', '2026-10-13', 'Design & Production', 'Production', 'Approve desain A4 — Registration, Face Art, GX Create', null, '', ''],
  ['T044', '2026-10-13', 'Games & Competition', 'Production', 'Due date desain Branding Games (Bali Games Rental)', null, '', ''],
  ['T031', '2026-10-16', 'Design & Production', 'Production', 'Final approval desain foamboard T-Banner People of GX & GX Game Zone', null, '', ''],
  ['T032', '2026-10-16', 'Design & Production', 'Production', 'Final approval desain placeholder A6 QR Code voting frame per tim', null, '', ''],
  ['T033', '2026-10-16', 'Design & Production', 'Production', 'Final approval desain foamboard landscape Winners & Xtreme Award', null, '', ''],
  ['T039', '2026-10-16', 'Games & Competition', 'Coordination', 'Finalisasi rules & mekanisme kemenangan seluruh games', null, '', ''],
  ['T046', '2026-10-16', 'Procurement', 'Procurement', 'Cetak gelang registrasi — 750 pcs', 'Done', '', ''],
  ['TL3-01', '2026-10-16', 'Procurement', 'Procurement', 'Cetak stempel — 12 pcs', 'Pending', 'Pak Arwin approve design', ''],
  ['TL3-02', '2026-10-16', 'Procurement', 'Procurement', 'Cetak kartu games — 500 pcs', 'Done', '', ''],
  ['T035', '2026-10-16', 'Procurement', 'Procurement', 'Beli tote bag DIY — 100 pcs', 'Pending', 'Pak X approve', ''],
  ['T034', '2026-10-16', 'Procurement', 'Procurement', 'Cetak stiker DTF', 'Pending', 'Desain belum selesai', ''],
  ['TL3-03', '2026-10-16', 'Procurement', 'Procurement', 'Beli acrylic A4 (Registrasi, Face Painting, DIY) — 3 pcs', 'Done', '', ''],
  ['TL3-04', '2026-10-16', 'Procurement', 'Procurement', 'Beli mini heat press — 1 pcs', 'Done', '', ''],
  ['TL3-05', '2026-10-16', 'Procurement', 'Procurement', 'Beli air horn — 2 pcs', 'Pending', 'Konfirmasi seller: availability warna kuning', ''],
  ['TL3-06', '2026-10-16', 'Procurement', 'Procurement', 'Beli smoke color celebration — 1 pack (5 warna)', 'Done', '', ''],
  ['TL3-07', '2026-10-16', 'Procurement', 'Procurement', 'Beli balon tepuk — 50 pcs', 'Done', '', ''],
  ['TL3-08', '2026-10-16', 'Procurement', 'Procurement', 'Cairkan dana rider', 'Done', '', ''],
  ['TL3-09', '2026-10-16', 'Procurement', 'Procurement', 'Cairkan dana laminating A4 — rules games (12 games)', 'Pending', 'Invoice', ''],
  ['TL3-10', '2026-10-16', 'Procurement', 'Procurement', 'Cairkan dana laminating A6 — QR Code voting frame (20 tim)', 'Pending', 'Invoice', ''],
  ['T040', '2026-10-20', 'Games & Competition', 'Coordination', 'Final approval desain voucher Alfamart — Games Tebak Lagu', null, '', ''],
  ['T041', '2026-10-20', 'Games & Competition', 'Coordination', 'Final approval desain voucher Diamond — Games Tebak Hero', null, '', ''],
  ['TL3-11', '2026-10-23', 'Design & Production', 'Production', 'Cetak voucher Alfamart & Diamond', null, '', ''],
  ['T036', '2026-10-23', 'Design & Production', 'Production', 'Approve desain tulisan "Wishes for GlobalXtreme" (Wall of Wishes)', null, '', ''],
  ['TL3-12', '2026-10-23', 'Entertainment', 'Coordination', 'Finalisasi MC Cue Card', null, '', ''],
  ['TL3-13', '2026-10-23', 'Entertainment', 'Coordination', 'Finalisasi musik iring-iringan Anniversary Ceremony', null, '', ''],
  ['TL3-14', '2026-10-23', 'Entertainment', 'Coordination', 'Finalisasi playlist musik acara (termasuk backup playlist)', null, '', ''],
  ['TL3-15', '2026-10-23', 'Tenants', 'Procurement', 'Finalisasi kontrak & pembayaran T-shirt eksklusif tenant', null, '', ''],
  ['TL3-16', '2026-10-24', 'GX Connect', 'Procurement', 'Pencairan dana dekorasi People of GX Frame — Rp2.000.000', null, '', ''],
  ['TL3-17', '2026-10-26', 'GX Connect', 'Coordination', 'Finalisasi QR Code voting frame setiap tim (termasuk nama seluruh tim)', null, '', ''],
  ['TL3-18', '2026-10-26', 'Event Day', 'Production', 'Video History GlobalXtreme siap review/approval', null, '', ''],
  ['T038', '2026-10-30', 'Design & Production', 'Production', 'Cetak seluruh foamboard', null, '', ''],
  ['TL3-19', '2026-10-30', 'Design & Production', 'Production', 'Cetak tulisan "Wishes for GlobalXtreme" (Wall of Wishes)', null, '', ''],
  ['T037', '2026-10-30', 'Design & Production', 'Production', 'Approve desain still image GX Mobile Legends untuk TV (Qualifier, Semifinal, 3rd Place, Grand Final)', null, '', ''],
  ['T042', '2026-10-30', 'Games & Competition', 'Coordination', 'Finalisasi Spin Wheel', null, '', ''],
  ['T043', '2026-10-30', 'Games & Competition', 'Production', 'Finalisasi handout penilaian juri GX Got Talent (Audition & Grand Final)', null, '', ''],
  ['TL3-20', '2026-10-30', 'Event Day', 'Coordination', 'Final approval Video History GlobalXtreme', null, '', ''],
  ['TL3-21', '2026-10-30', 'Event Day', 'Coordination', 'Finalisasi 29 nama karyawan untuk iring-iringan', null, '', '2 orang: Air Horn\n2 orang: Smoke Color\n25 orang: Balon Tepuk (50 pcs)'],
  ['TL3-22', '2026-10-30', 'Event Day', 'Coordination', 'Final approval supporting crew acara', null, '', ''],
  ['TL3-23', '2026-11-07', 'Design & Production', 'Procurement', 'Pembelian papan untuk Wall of Wishes', null, '', ''],
  ['T056', '2026-11-12', 'GX Got Talent', 'Procurement', 'Pencairan dana GX Got Talent — Rp5.000.000', null, '', ''],
  ['TL3-24', '2026-11-13', 'Preparation', 'Coordination', 'Meeting final bersama FOH, MC, Divisi Acara & Divisi Perlengkapan', null, '', ''],
  ['TL3-25', '2026-11-13', 'HYROX', 'Procurement', 'Pelunasan GX Race (Hyrox)', null, '', ''],
  ['TL3-26', '2026-11-13', 'Entertainment', 'Procurement', 'Pelunasan Spectrum', null, '', ''],
  ['TL3-27', '2026-11-13', 'Entertainment', 'Procurement', 'Pelunasan Not So Koplo', null, '', ''],
  ['TL3-28', '2026-11-13', 'Entertainment', 'Procurement', 'Pelunasan DJ Bestman', null, '', ''],
  ['TL3-29', '2026-11-13', 'Entertainment', 'Procurement', 'Pelunasan MC', null, '', ''],
  ['TL3-30', '2026-11-13', 'Activation', 'Procurement', 'Pelunasan Face Painting', null, '', ''],
  ['TL3-31', '2026-11-13', 'Activation', 'Procurement', 'Pelunasan Tarot', null, '', '']
];
// budget items that move to the new, more specific task
var TL3_LINKS = { F070: 'TL3-01', F069: 'TL3-02', F067: 'TL3-16', F091: 'TL3-25', F092: 'TL3-26', F093: 'TL3-27', F095: 'TL3-28', F094: 'TL3-29', F074: 'TL3-30', F075: 'TL3-31' };
// replaced by the tasks above (only removed when nothing in Finance points to them any more)
var TL3_REMOVE = ['T047', 'T048', 'T049', 'T050', 'T051', 'T052', 'T053', 'T055', 'T057', 'T058', 'T059'];
function applyTimelineV3(d) {
  var byId = {}; d.tasks.forEach(function (t) { byId[t.id] = t; });
  var now = Date.now();
  TL3.forEach(function (r) {
    var t = byId[r[0]];
    if (!t) { t = { id: r[0], createdAt: now, start: '2026-10-01', pic: '', status: 'Not Started', notes: '', blockers: '', dependencies: '', source: 'confirmed', verifyNote: '' }; d.tasks.push(t); byId[r[0]] = t; }
    t.deadline = r[1]; t.workstream = r[2]; t.category = r[3]; t.name = r[4];
    if (!t.start || t.start > r[1]) t.start = r[1] < '2026-10-01' ? r[1] : '2026-10-01';
    if (r[5]) t.status = r[5];
    if (r[6]) t.notes = 'Menunggu: ' + r[6];
    if (r[7]) t.notes = r[7];
    else if (/^(Approval desain A4\.|Design belum selesai\.|Menunggu approval Pak X\.)$/.test(t.notes || '')) t.notes = '';
    t.source = 'confirmed'; t.updatedAt = now;
  });
  d.finance.forEach(function (f) { if (TL3_LINKS[f.id] && byId[TL3_LINKS[f.id]]) f.taskId = TL3_LINKS[f.id]; });
  var linked = {}; d.finance.forEach(function (f) { if (f.taskId) linked[f.taskId] = 1; });
  d.tasks = d.tasks.filter(function (t) { return TL3_REMOVE.indexOf(t.id) < 0 || linked[t.id]; });
  d.timelineV3 = true;
}

var TODO_SEED = /* from GX27_Rundown_1.xlsx, sheet "To-do list": [id, workstream, category, task, PIC, done, notes] */ [["TD-002", "Operasional", "Coordination", "WA Group GX Launch semua activity", "Esi", 1, ""], ["TD-005", "Stage", "Production", "LED tiap segmen", "Esi", 0, ""], ["TD-006", "Stage", "Coordination", "Playlist music by device", "Putri", 0, ""], ["TD-007", "Stage", "Coordination", "Spinwheel berdasarkan masa kerja", "HC, Putri", 1, "Output: https://gxvote.globalxtreme-solutions.net/doorprize\n\nAdmin Doorprize\nhttps://gxvote.globalxtreme-solutions.net/admin/doorprize\nUntuk doorprize tetep harus ada pic mainstage yang memantau"], ["TD-011", "GX Access Point", "Coordination", "Lock pake wristband apa (barcode/RFID)", "Putri, Pak Arwin", 1, ""], ["TD-012", "GX Access Point", "Coordination", "Lock kegunaan wristbandnya untuk apa aja (absen aja atau sama F&B)", "Putri, Pak Arwin", 1, ""], ["TD-013", "GX Access Point", "Procurement", "Cari vendor gelang baru yang pake kertas", "Putri", 1, "Cahya printing, Eka Printing \n2cm x 24cm"], ["TD-014", "GX Access Point", "Production", "Design gelang", "Putri, Creative", 1, "sudah cetak sample"], ["TD-015", "GX Access Point", "Procurement", "Bayar DP Vendor", "Putri, Finance", 0, ""], ["TD-016", "GX Access Point", "Coordination", "List & siapkan perlengkapan registrasi (meja kursi, kabel stop kontak, device untuk scan, laptop)", "Putri, Perlengkapan", 0, ""], ["TD-017", "GX Access Point", "Production", "Form dan Barcode untuk registration", "Putri", 1, "Output: https://gxpass.globalxtreme-solutions.net/login\n\nsoftware@globalxtreme.dev\nGl0b4l388x101@#$"], ["TD-018", "GX Access Point", "Coordination", "Tentuin regis person", "Putri, Pak Atong", 1, "2 PIC :\n- Carla (Legal)\n- Dipta (CSO)"], ["TD-019", "GX Access Point", "Coordination", "Registration briefing", "Putri", 0, ""], ["TD-020", "GX Connect", "Coordination", "Lock mission", "Esi, Pak Atong, Pak Arwin", 1, ""], ["TD-021", "GX Connect", "Coordination", "Lock game flow/rules", "Esi, Pak Atong, Pak Arwin", 1, ""], ["TD-022", "GX Connect", "Coordination", "Pindahin nomor telepon karyawan di spreadsheet HC ke pembagian 20 tim", "Esi", 1, "Output: Team Building"], ["TD-023", "GX Connect", "Coordination", "Nanya ojisan punya kodak flash", "Putri", 1, "Output: kamera fujifilm"], ["TD-024", "GX Connect", "Coordination", "Lock kriteria dari setiap winning category & proper file nya", "Esi, Pak Atong, Pak Arwin", 1, ""], ["TD-025", "GX Connect", "Production", "Proper rules file untuk didistribusikan ke karyawan", "Esi, Putri", 1, "Output: https://gxconnect27.figma.site"], ["TD-026", "GX Connect", "Production", "Deck GX Connect bikin versi indo", "Putri", 1, ""], ["TD-027", "GX Connect", "Production", "Team Formation baru dari Cecil", "Esi", 1, ""], ["TD-028", "GX Connect", "Production", "Adjust Ketua Tim di Form Submit", "Esi", 1, ""], ["TD-029", "GX Connect", "Procurement", "Beli 22 fujifilm", "Esi, Finance", 1, ""], ["TD-031", "GX Connect", "Procurement", "People of GX · Cari toko beli frame", "Putri", 1, "Output: shopee > putri"], ["TD-032", "GX Connect", "Coordination", "People of GX · Buat rules untuk dipajang di area People of GX (How to vote)", "Esi, Putri", 1, "Output: https://docs.google.com/document/d/1so8qFm6vTXmHi7r7q5UwlrMV9hu3nkBoHDl_3nNjKgQ/edit?usp=sharing\nditunggu tim creative secepatnya"], ["TD-033", "GX Connect", "Production", "People of GX · Copy T banner How to vote online dan barcode 20 tim", "Putri", 0, ""], ["TD-034", "GX Connect", "Coordination", "People of GX · Technical Meeting", "Putri, Pak Atong, Pak Arwin, Esi", 1, ""], ["TD-035", "GX Connect", "Procurement", "People of GX · Beli 20 frame", "Putri, Finance", 1, ""], ["TD-036", "GX Connect", "Procurement", "People of GX · Cetak foto ukuran 3R + Soft file", "Putri, Finance", 0, "cetak semuanya aja, biar tim atur mana yang mau dia tempel"], ["TD-037", "GX Connect", "Coordination", "People of GX · Technical Meeting + Bagi Kamera + Frame + Cash Fund", "Esi, Putri", 1, ""], ["TD-038", "GX Connect", "Coordination", "People of GX · Technical Meeting + Bagi Frame + Cash Fund + Foto 3r", "Esi, Putri", 0, ""], ["TD-039", "GX Connect", "Production", "People of GX · Foamboard Pemenang", "Esi, Putri", 0, ""], ["TD-040", "GX Got Talent", "Coordination", "Lock rules dan batasan2nya", "Pak Atong, Pak Arwin, Putri", 1, ""], ["TD-041", "GX Got Talent", "Coordination", "Lock mekanisme Xtreme Buzzer", "Pak Atong, Pak Arwin", 0, ""], ["TD-042", "GX Got Talent", "Coordination", "Buat rules ready to send to employees", "Pak Atong, Putri", 1, "Output: https://gxgotalent.figma.site"], ["TD-043", "GX Got Talent", "Procurement", "Beli button buzzer X", "Esi", 0, ""], ["TD-044", "GX Got Talent", "Production", "Set deadline untuk 5 finalis menghubungi panitia dan menginformasikan kebutuhan support/perlengkapan untuk penampilan mereka di stage", "Pak Atong, Putri", 0, ""], ["TD-045", "GX Got Talent", "Coordination", "Koordinasi keperluan 5 finalis ke tim perlengkapan", "Perlengkapan, Putri", 0, ""], ["TD-046", "GX Got Talent", "Coordination", "Tentukan juri babak audisi", "Pak Atong", 1, "Output: pak arwin, pak atong, vira, cecil"], ["TD-047", "GX Got Talent", "Coordination", "Tentukan juri grand final", "Pak Atong", 1, "Output: bu dhani, pak rizal, bu surya, pak malik\nhasil meeting: pak alik, pak anton, bu dhani, pak malik"], ["TD-048", "GX Got Talent", "Production", "Buat formulir penilaian juri", "Pak Atong, Putri", 0, ""], ["TD-049", "GX Got Talent", "Coordination", "Tentukan dimana posisi duduk juri saat grand final--- sediakan kursi dan mejanya", "Pak Atong, Perlengkapan", 0, ""], ["TD-050", "GX Got Talent", "Production", "Foamboard Pemenang", "Putri, Esi", 0, ""], ["TD-051", "HYROX", "Procurement", "Cari vendor hyrox", "Pak Atong, Esi, Putri", 1, "Output: Ultrafit\nSudah kontak: WEFITNESS, Will Fitness, Elite Fit, Body Factory, Kanana Gym, Obsidian, Paradise, Ultrafit, Wanderlust"], ["TD-052", "HYROX", "Procurement", "Mekanisme hyrox---koordinasi dengan vendor", "Pak Atong, Esi, Putri, Perlengkapan", 1, ""], ["TD-053", "HYROX", "Procurement", "Bayar DP vendor hyrox", "Finance, Esi", 1, ""], ["TD-054", "HYROX", "Coordination", "Koordinasi loading-in alat2 hyrox", "Perlengkapan", 0, ""], ["TD-055", "HYROX", "Production", "Deck Hyrox", "Putri", 0, "Output: https://gxhyrox.figma.site"], ["TD-056", "HYROX", "Coordination", "List perlengkapan", "", 0, ""], ["TD-061", "Tenants", "Coordination", "Lock siapa aja tenant nya", "Putri, Pak Atong, Pak Arwin", 0, ""], ["TD-062", "Tenants", "Coordination", "List keperluan tenant di booth > handover to perlengkapan team", "Putri, Perlengkapan", 0, ""], ["TD-063", "Tenants", "Coordination", "Koordinasi sistem diskon untuk karyawan GX dengan masing2 tenant", "Putri, Pak Atong, Pak Arwin", 0, ""], ["TD-064", "Tenants", "Coordination", "Koordinasi loading-in barang2 tenant di D-day", "Putri, Perlengkapan", 0, ""], ["TD-067", "Activation", "Coordination", "DIY Totebag · Deal dengan 1989", "Esi", 0, "Output: batal"], ["TD-068", "Activation", "Procurement", "DIY Totebag · Bayar DP", "Esi, Finance", 0, ""], ["TD-069", "Activation", "Coordination", "DIY Totebag · Koordinasi keperluan di booth", "Esi, Perlengkapan", 0, ""], ["TD-070", "Activation", "Procurement", "DIY Totebag · Beli alat pemanas", "Esi", 0, ""], ["TD-071", "Activation", "Procurement", "DIY Totebag · Beli sticker", "Esi", 0, ""], ["TD-072", "Activation", "Procurement", "DIY Totebag · Beli totebag", "Esi", 0, ""], ["TD-073", "Activation", "Procurement", "DIY Totebag · Cari alternativ vendor custom charm", "Esi", 0, "Output: - topi: https://shopee.co.id/Topi-polos-baseball-topi-polos-pria-wanita-murah-i.209078063.4479406676?extraParams=%7B%22display_model_id%22%3A38435649778%2C%22model_selection_logic%22%3A3%7D\n- film dtf: https://shopee.co.id/Sablon-Setrika-Sablon-DTF-Sehari-Jadi!-Satuan-Custom-Gambar-Ukuran-Print-A7-A6-A5-A4-A3-Tanpa-Minimal-Order-i.1481867746.24494986696?extraParams=%7B%22display_model_id%22%3A128333075682%2C%22model_selection_logic%22%3A3%7D"], ["TD-075", "Activation", "Coordination", "Face Painting · Koordinasi keperluan di booth", "Esi, Perlengkapan, Creative", 1, ""], ["TD-076", "Activation", "Procurement", "Face Painting · Bayar DP", "Esi, Finance", 1, ""], ["TD-079", "Activation", "Coordination", "Tarot Reading · Koordinasi keperluan di booth", "Esi, Perlengkapan, Creative", 1, ""], ["TD-080", "Activation", "Procurement", "Tarot Reading · Bayar DP", "Esi, Finance", 1, ""], ["TD-084", "Games", "Coordination", "Bali Games Rental · Mekanisme main dan menang", "Esi, Pak Atong, Pak Arwin", 0, ""], ["TD-085", "Games", "Coordination", "Bali Games Rental · Mau di-branding gak gamesnya?", "Esi, Creative", 0, ""], ["TD-086", "Games", "Coordination", "Bali Games Rental · Koordinasi keperluan di booth", "Esi, Perlengkapan, Creative", 0, ""], ["TD-087", "Games", "Procurement", "Bali Games Rental · Bayar DP", "Esi, Finance", 1, ""], ["TD-091", "Games", "Coordination", "BUMI Creative · Mekanisme main dan menang", "Esi, Pak Atong, Pak Arwin", 0, ""], ["TD-092", "Games", "Coordination", "BUMI Creative · Koordinasi keperluan di booth", "Esi, Perlengkapan", 0, ""], ["TD-093", "Games", "Procurement", "BUMI Creative · Bayar DP", "Esi, Finance", 1, ""], ["TD-098", "Games", "Procurement", "GX Game Pass Card · Cari vendor stamp dan kartu", "Esi", 0, ""], ["TD-099", "Games", "Coordination", "GX Game Pass Card · Alter kartu >> kertas", "Esi", 0, ""], ["TD-100", "Games", "Production", "GX Game Pass Card · Design", "Creative", 0, ""], ["TD-103", "Entertainment", "Coordination", "Not so koplo", "Putri, Pak Atong, Pak Arwin", 1, ""], ["TD-104", "Entertainment", "Procurement", "Not So Koplo · Bayar DP", "Putri, Finance", 0, ""], ["TD-119", "Entertainment", "Coordination", "MC", "Putri", 0, "Output: Spectrum aja"], ["TD-125", "Doorprize", "Coordination", "Bikin skema dapetin doorprize", "Putri", 0, ""]];
function applyTodoV1(d) {
  var have = {}; d.tasks.forEach(function (t) { have[t.id] = 1; });
  var now = Date.now();
  TODO_SEED.forEach(function (r) {
    if (have[r[0]]) return;
    d.tasks.push({ id: r[0], name: r[3], workstream: r[1], category: r[2], start: '2026-10-01', deadline: '', pic: r[4], status: r[5] ? 'Done' : 'Not Started',
      notes: r[6] || '', blockers: '', dependencies: '', source: 'confirmed', verifyNote: '', createdAt: now, updatedAt: now });
  });
  d.todoV1 = true;
}
// Every purchasable budget item gets its own task (category Procurement), so Finance and Tasks list the same items.
// Line items inside a vendor invoice get a task too (payment status and due date follow the vendor row). Only fund allocation rows are skipped (their usage rows get tasks). Tasks made here have id TF-<finance id>.
var FIN_PLACEHOLDER = 'Task dibuat untuk menampung baris budget';
function syncFinanceTasks(d, s) {
  var byId = {}, fById = {}, links0 = {}, used = {};
  d.tasks.forEach(function (t) { byId[t.id] = t; used[t.id] = 1; });
  d.finance.forEach(function (f) { fById[f.id] = f; if (f.taskId) links0[f.taskId] = (links0[f.taskId] || 0) + 1; });
  var doneSt = (s.taskStatuses.filter(function (x) { return x.type === 'done'; })[0] || {}).name;
  var todoSt = (s.taskStatuses.filter(function (x) { return x.type === 'todo'; })[0] || s.taskStatuses[0]).name;
  var now = Date.now();
  // All Doorprize budget rows (the Shopee invoice and its ~20 prizes) share ONE task: "Doorprize procurement"
  var doorRows = d.finance.filter(function (f) { return f.workstream === 'Doorprize'; }), door = null;
  function ensureDoor() {
    if (door) return door;
    door = byId['TF-DOORPRIZE'] || d.tasks.filter(function (t) { return sameName(t.name, 'Doorprize procurement'); })[0];
    if (!door) {
      var v = doorRows.filter(function (f) { return f.kind === 'vendor'; })[0] || doorRows[0] || {};
      var vd = (s.payStatuses || []).filter(function (x) { return x.name === v.paymentStatus; })[0];
      var vType = vd ? vd.type : (PAY_GUESS[String(v.paymentStatus || '').toLowerCase()] || 'unpaid');
      door = { id: 'TF-DOORPRIZE', name: 'Doorprize Procurement', workstream: 'Doorprize', category: 'Procurement', start: '', deadline: v.paymentDeadline || '', pic: '',
        status: vType === 'paid' && doneSt ? doneSt : todoSt, notes: 'Semua item doorprize (belanja Shopee), terhubung ke budget di Finance.', blockers: '', dependencies: '', source: 'confirmed', verifyNote: '', createdAt: now, updatedAt: now };
      d.tasks.push(door); byId[door.id] = door;
    }
    if (String(door.verifyNote || '').indexOf(FIN_PLACEHOLDER) === 0) { door.verifyNote = ''; door.source = 'confirmed'; }
    return door;
  }
  // Runs on every load, so data that already has one task per prize heals itself (rows move to the single task, untouched per-prize tasks are removed)
  if (doorRows.length) {
    var dt = ensureDoor();
    var perItem = function (t) { return t.workstream === 'Doorprize' && t.id !== dt.id && (t.autoFin || String(t.id).indexOf('TF-') === 0); };
    var tById = {}; d.tasks.forEach(function (t) { tById[t.id] = t; });
    doorRows.forEach(function (f) {
      var cur = f.taskId ? tById[f.taskId] : null;
      if (!cur || perItem(cur) || !f.taskSynced) { f.taskId = dt.id; f.taskSynced = true; f.updatedAt = now; }
    });
    d.tasks = d.tasks.filter(function (t) {
      if (!perItem(t)) return true;
      if (!t.pic && (!t.notes || String(t.notes).indexOf('Bagian dari') === 0)) return false;
      delete t.autoFin; return true;
    });
  }
  d.doorprizeOne2 = true;
  // Items that are included in a vendor invoice take the invoice status of the top row (e.g. Submitted)
  d.finance.forEach(function (f) {
    var p = f.parentId ? fById[f.parentId] : null;
    if (p && p.kind === 'vendor' && p.invoiceStatus && f.invoiceStatus !== p.invoiceStatus) { f.invoiceStatus = p.invoiceStatus; f.updatedAt = now; }
  });
  d.finance.forEach(function (f) {
    if (f.taskSynced && f.taskId && byId[f.taskId]) return;   // already linked to a task that still exists (a missing/deleted task gets re-made)
    if (f.workstream === 'Doorprize') { f.taskId = ensureDoor().id; f.taskSynced = true; f.updatedAt = now; return; }
    var parent = f.parentId ? fById[f.parentId] : null;
    if (f.kind === 'allocation') return;
    if (parent && (parent.kind === 'vendor' || parent.kind === 'allocation')) return;   // line item of a vendor invoice / usage of a fund: merged into the parent's task below
    var src = parent && parent.kind === 'vendor' ? parent : f;   // who carries the payment
    var cur = f.taskId ? byId[f.taskId] : null;
    var placeholder = cur && String(cur.verifyNote || '').indexOf(FIN_PLACEHOLDER) === 0;
    if (cur && !placeholder && links0[cur.id] === 1) { f.taskSynced = true; return; }   // already has its own task
    var id = 'TF-' + f.id, t = byId[id];
    if (!t) {
      var pd = (s.payStatuses || []).filter(function (x) { return x.name === src.paymentStatus; })[0];
      var pType = pd ? pd.type : (PAY_GUESS[String(src.paymentStatus || '').toLowerCase()] || 'unpaid');
      t = { id: id, name: f.item || '(tanpa nama)', workstream: f.workstream || '', category: 'Procurement', start: '', deadline: src.paymentDeadline || '', pic: '',
        status: pType === 'paid' && doneSt ? doneSt : todoSt, notes: src !== f ? 'Bagian dari ' + (src.item || 'vendor invoice') : '', blockers: '', dependencies: '', source: 'confirmed', verifyNote: '', autoFin: f.id, createdAt: now, updatedAt: now };
      d.tasks.push(t); byId[id] = t;
    }
    f.taskId = id; f.taskSynced = true; f.updatedAt = now;
  });
  // Every vendor invoice with line items (Bali Games, BUMI, OJISAN, ...) works like Doorprize: its items are merged into ONE task,
  // the task that carries the invoice. v13: fund allocations (Emergency Fund) work the same way — every usage row in Finance is listed
  // live under the allocation's task ("Alokasi Emergency Fund"), so a row added / edited / deleted in Finance shows up there right away.
  function vendorTask(p) {
    var cur = p.taskId ? byId[p.taskId] : null;
    if (cur) return cur;
    var id = 'TF-' + p.id, t = byId[id];
    if (!t) {
      var pd = (s.payStatuses || []).filter(function (x) { return x.name === p.paymentStatus; })[0];
      var pType = pd ? pd.type : (PAY_GUESS[String(p.paymentStatus || '').toLowerCase()] || 'unpaid');
      t = { id: id, name: p.item || '(tanpa nama)', workstream: p.workstream || '', category: 'Procurement', start: '', deadline: p.paymentDeadline || '', pic: '',
        status: pType === 'paid' && doneSt ? doneSt : todoSt, notes: '', blockers: '', dependencies: '', source: 'confirmed', verifyNote: '', autoFin: p.id, createdAt: now, updatedAt: now };
      d.tasks.push(t); byId[id] = t;
    }
    p.taskId = id; p.taskSynced = true; p.updatedAt = now;
    return t;
  }
  d.finance.forEach(function (f) {
    var p = f.parentId ? fById[f.parentId] : null;
    if (!p || (p.kind !== 'vendor' && p.kind !== 'allocation') || p.workstream === 'Doorprize') return;     // Doorprize is handled above
    var cur = f.taskId ? byId[f.taskId] : null;
    var own = cur && (cur.id === 'TF-' + f.id || cur.autoFin === f.id);        // a task that was auto-made just for this item
    if (cur && !own && f.taskSynced) return;                                   // linked somewhere on purpose: leave it
    var vt = vendorTask(p);
    if (f.taskId !== vt.id) { f.taskId = vt.id; f.updatedAt = now; }
    f.taskSynced = true;
  });
  var linked = {}; d.finance.forEach(function (f) { if (f.taskId) linked[f.taskId] = 1; });
  d.tasks = d.tasks.filter(function (t) {
    if (String(t.verifyNote || '').indexOf(FIN_PLACEHOLDER) === 0 && !linked[t.id]) return false;      // generic holder task nobody uses any more
    if (t.autoFin && !fById[t.autoFin]) { if (!t.pic && !t.notes) return false; delete t.autoFin; }   // its budget item was deleted
    if (t.autoFin && fById[t.autoFin] && !linked[t.id] && !t.pic && (!t.notes || String(t.notes).indexOf('Bagian dari') === 0)) return false;   // item moved into its vendor invoice's task; nothing was typed here
    return true;
  });
  // A budget item's workstream (e.g. GX Access Point, GX Game Pass) is added to the task it is linked to, so the task shows up when filtering by that workstream (once per item, so manual edits stick)
  d.finance.forEach(function (f) {
    if (f.wsSynced || !f.workstream || !f.taskId) return;
    var t = byId[f.taskId]; if (!t) return;
    var cur = taskWorkstreams(t);
    if (cur.indexOf(f.workstream) < 0) { t.workstreams = cur.concat([f.workstream]); t.updatedAt = now; }
    f.wsSynced = true;
  });
  d.finTasksV1 = true;
}
function normalizeDb(d) {
  d = d && typeof d === 'object' ? d : {};
  if (!Array.isArray(d.tasks)) d.tasks = [];
  if (!Array.isArray(d.finance)) d.finance = [];
  var s = {}, k, hadStatuses = !!(d.settings && Array.isArray(d.settings.taskStatuses) && d.settings.taskStatuses.length);
  for (k in SETTINGS_DEFAULT) s[k] = (SETTINGS_DEFAULT[k] && typeof SETTINGS_DEFAULT[k] === 'object') ? JSON.parse(JSON.stringify(SETTINGS_DEFAULT[k])) : SETTINGS_DEFAULT[k];
  if (d.settings && typeof d.settings === 'object') for (k in d.settings) if (d.settings[k] !== undefined && d.settings[k] !== null) s[k] = d.settings[k];
  if (!Array.isArray(s.prepDeadlines)) s.prepDeadlines = SETTINGS_DEFAULT.prepDeadlines.slice();
  ['taskCategories', 'workstreams'].forEach(function (k) { if (!Array.isArray(s[k]) || !s[k].length) s[k] = SETTINGS_DEFAULT[k].slice(); });
  if (!Array.isArray(s.pics)) s.pics = SETTINGS_DEFAULT.pics.slice();
  if (!Array.isArray(s.payStatuses) || !s.payStatuses.length) s.payStatuses = JSON.parse(JSON.stringify(PAY_DEFAULT));
  s.payStatuses = s.payStatuses.filter(function (x) { return x && x.name; }).map(function (x) { return { name: String(x.name), type: ['unpaid', 'partial', 'paid'].indexOf(x.type) > -1 ? x.type : 'unpaid', color: x.color || 'neutral' }; });
  (d.finance || []).forEach(function (f) { if (f.paymentStatus && !s.payStatuses.some(function (x) { return x.name === f.paymentStatus; })) s.payStatuses.push({ name: f.paymentStatus, type: PAY_GUESS[f.paymentStatus.toLowerCase()] || 'unpaid', color: 'neutral' }); });
  s.pics = s.pics.map(function (x) { return String(x).trim(); }).filter(function (x, i, a) { return x && a.indexOf(x) === i; });
  // one-time change requested by the team: every task starts on 1 Oct 2026 (a deadline before that keeps its own date)
  if (!d.timelineV3) applyTimelineV3(d);
  if (!d.todoV1) applyTodoV1(d);
  if (!d.taskFieldsV2) {
    // Blockers, Dependencies and Verification note were removed from tasks: keep their text inside Notes
    d.tasks.forEach(function (t) {
      var add = [];
      if (t.blockers) add.push('Blocker: ' + t.blockers);
      if (t.dependencies) add.push('Menunggu: ' + t.dependencies);
      add = add.filter(function (x) { return (t.notes || '').indexOf(x) < 0; });
      if (add.length) t.notes = (t.notes ? t.notes + '\n' : '') + add.join('\n');
      t.blockers = ''; t.dependencies = ''; t.verifyNote = '';
    });
    d.taskFieldsV2 = true;
  }
  [['taskCategories', d.tasks.map(function (t) { return t.category; })],
   ['workstreams', [].concat.apply([], d.tasks.concat(d.finance).map(function (r) { return (Array.isArray(r.workstreams) ? r.workstreams : []).concat([r.workstream]); }))],
   ['pics', [].concat.apply([], d.tasks.concat(d.rundown || []).map(function (t) { return picsOf(t.pic); }))]].forEach(function (x) {
    x[1].forEach(function (v) { if (v && s[x[0]].indexOf(v) < 0) s[x[0]].push(v); });
  });
  if (!d.startOct1) {
    d.tasks.forEach(function (t) { if (!t.deadline || t.deadline >= '2026-10-01') t.start = '2026-10-01'; });
    d.startOct1 = true;
  }
  if (!hadStatuses) {
    // first time statuses are managed: use the 4 standard statuses and move old ones over
    s.taskStatuses = JSON.parse(JSON.stringify(STATUS_DEFAULT_SEED));
    (d.tasks || []).forEach(function (t) { if (STATUS_MIGRATE[t.status]) t.status = STATUS_MIGRATE[t.status]; });
  }
  s.taskStatuses = s.taskStatuses.filter(function (x) { return x && x.name; }).map(function (x) {
    return { name: String(x.name), type: ['todo', 'progress', 'pending', 'blocked', 'done'].indexOf(x.type) > -1 ? x.type : 'todo', color: x.color || 'neutral' };
  });
  // a status used by a task but missing from the list is added so it stays visible and editable
  (d.tasks || []).forEach(function (t) {
    if (t.status && !s.taskStatuses.some(function (x) { return x.name === t.status; })) s.taskStatuses.push({ name: t.status, type: 'todo', color: 'neutral' });
  });
  normalizeColumns(s);
  if (!s.finMinimal) {
    // simpler Finance table by default; hidden columns can be shown again via Kelola kolom
    var SHOW = { item: 1, est: 1, paid: 1, remaining: 1, paymentDeadline: 1, paymentStatus: 1, task: 1 };
    var OLD = { est: 'Est. total', paid: 'Paid', remaining: 'Remaining', paymentDeadline: 'Pay deadline', task: 'Linked task', check: 'Check' };
    s.columns.finance.forEach(function (c) {
      if (c.custom) return;
      c.visible = !!SHOW[c.key];
      if (OLD[c.key] && c.label === OLD[c.key]) c.label = builtinCol('finance', c.key).label;
    });
    s.finMinimal = true;
  }
  syncFinanceTasks(d, s);
  if (!s.wsOrigin || typeof s.wsOrigin !== 'object' || Array.isArray(s.wsOrigin)) s.wsOrigin = {};
  wsColorSlots(s);
  d.settings = s;
  // Rundown added later: older saved data gets the rundown from the sheet, nothing else is touched
  if (!Array.isArray(d.rundown)) { d.rundown = rundownSeed(); d.flowMeta = FLOW_SEED.meta; }
  if (!d.rundown.some(function (r) { return r.group === 'flow'; }) && !d.flowSeeded) {
    d.rundown = flowSeedItems().concat(d.rundown); d.flowMeta = FLOW_SEED.meta;
  }
  d.flowSeeded = true;
  // the detailed cue sheet (sheet R5) was removed from the site
  d.rundown = d.rundown.filter(function (r) { return r.group === 'flow' || !r.group; });
  delete d.rundownMeta;
  var stNames = s.taskStatuses.map(function (x) { return x.name; }), stFirst = (s.taskStatuses.filter(function (x) { return x.type === 'todo'; })[0] || s.taskStatuses[0]).name;
  d.rundown.forEach(function (r) {
    if (RUNDOWN_STATUS_MIGRATE[r.status] && stNames.indexOf(r.status) < 0) r.status = stNames.indexOf(RUNDOWN_STATUS_MIGRATE[r.status]) > -1 ? RUNDOWN_STATUS_MIGRATE[r.status] : stFirst;
    if (!r.status) r.status = stFirst;
  });
  d.rundown.forEach(function (r) { r.group = 'flow'; if (!Array.isArray(r.concurrent)) r.concurrent = r.concurrent ? String(r.concurrent).split('\n').filter(Boolean) : []; });
  if (!Array.isArray(d.zones)) d.zones = zonesSeed();
  // an empty rundown/zone list that nobody emptied on purpose (e.g. saved while a data file was missing) gets the built-in data back
  if (!d.rundown.length && !d.rundownCleared) d.rundown = rundownSeed();
  if (!d.zones.length && !d.zonesCleared) d.zones = zonesSeed();
  if (!d.flowMeta) d.flowMeta = FLOW_SEED.meta;
  if ((SHEET_SEED.items || []).length) {
    var sh = budgetSeedHash();
    if (!d.finance.length && !d.financeCleared) applyBudgetSeed(d);                       // never leave Finance empty
    else if (d.budgetSeedHash !== sh && d.budgetSeedHash && d.financeHashAtSeed === financeHash(d.finance) && MODE !== 'public') applyBudgetSeed(d); // untouched → follow the newest sheet
    d.budgetUpdateAvailable = d.budgetSeedHash !== sh && d.budgetIgnored !== sh;
  }
  if (!d.capsV9) applyCapsV9(d);
  return d;
}
function logoSrc() { return (db && db.settings && db.settings.logoUrl) || DEFAULT_LOGO; }
function applySettings() {
  var s = db.settings || SETTINGS_DEFAULT;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s.eventDate || '')) EVENT_DATE = s.eventDate;
  PREP_DEADLINES = (s.prepDeadlines || []).filter(function (x) { return /^\d{4}-\d{2}-\d{2}$/.test(x); }).sort();
  var title = s.siteTitle || SETTINGS_DEFAULT.siteTitle;
  var nameEl = document.querySelector('.brand .name');
  if (nameEl) nameEl.innerHTML = /^GX27/.test(title) ? 'GX<span>27</span>' + esc(title.slice(4)) : esc(title);
  var subEl = document.querySelector('.brand .sub'); if (subEl) subEl.textContent = s.siteSubtitle || '';
  var logoEl = document.querySelector('.brand .logo'); if (logoEl && logoEl.getAttribute('src') !== logoSrc()) logoEl.setAttribute('src', logoSrc());
  document.title = title + (MODE === 'admin' ? ' · Admin' : '');
}
// Task statuses are managed from the site (Kelola kategori → Status task). Each status has a TYPE that drives behaviour:
//   todo = belum mulai · progress = berjalan · pending = menunggu (approval/vendor) · blocked = terhambat (wajib isi blocker) · done = selesai
var STATUS_TYPES = [
  { value: 'todo', label: 'Belum Mulai' }, { value: 'progress', label: 'Berjalan' }, { value: 'pending', label: 'Menunggu' },
  { value: 'blocked', label: 'Terhambat (Wajib Isi Blocker)' }, { value: 'done', label: 'Selesai' }
];
var STATUS_COLORS = [
  { value: 'neutral', label: 'Abu-abu' }, { value: 'info', label: 'Biru' }, { value: 'warn', label: 'Kuning' },
  { value: 'crit', label: 'Merah' }, { value: 'ok', label: 'Hijau' }, { value: 'accent', label: 'Kuning GX' }
];
var STATUS_DEFAULT = STATUS_DEFAULT_SEED;
var TYPE_ORDER = { blocked: 0, pending: 1, progress: 2, todo: 3, done: 4 };
function statusDefs() { return (db && db.settings && db.settings.taskStatuses) || STATUS_DEFAULT; }
function statusList() { return statusDefs().map(function (x) { return x.name; }); }
function statusDef(name) { var d = statusDefs().filter(function (x) { return x.name === name; })[0]; return d || { name: name, type: 'todo', color: 'neutral' }; }
function sType(status) { return statusDef(status).type; }
function isDone(t) { return sType(t.status) === 'done'; }
function defaultStatus() { var d = statusDefs().filter(function (x) { return x.type === 'todo'; })[0] || statusDefs()[0]; return d ? d.name : 'Not Started'; }
var COLOR_VAR = { neutral: 'var(--faint)', info: 'var(--info)', warn: 'var(--warn)', crit: 'var(--crit)', ok: 'var(--ok)', accent: 'var(--accent)' };
// payment statuses are editable (settings.payStatuses); 'type' drives the maths:
// unpaid = nothing paid yet, partial = DP paid (paid = DP amount), paid = lunas (paid = invoice/estimate)
var PAY_DEFAULT = [
  { name: 'Pending Payment', type: 'unpaid', color: 'warn' },
  { name: 'Outstanding Payment', type: 'unpaid', color: 'crit' },
  { name: 'DP Paid', type: 'partial', color: 'info' },
  { name: 'Full Paid', type: 'paid', color: 'ok' }
];
var PAY_TYPES = [{ value: 'unpaid', label: 'Belum Bayar' }, { value: 'partial', label: 'Bayar Sebagian (DP)' }, { value: 'paid', label: 'Lunas' }];
var PAY_GUESS = { 'full paid': 'paid', 'lunas': 'paid', 'dp paid': 'partial' };
function payDefs() { return (db && db.settings && db.settings.payStatuses) || PAY_DEFAULT; }
function payList() { return payDefs().map(function (x) { return x.name; }); }
function payDef(name) { return payDefs().filter(function (x) { return x.name === name; })[0] || { name: name, type: PAY_GUESS[String(name || '').toLowerCase()] || 'unpaid', color: 'neutral' }; }
function payType(name) { return payDef(name).type; }
function payFirst(type) { var d = payDefs().filter(function (x) { return x.type === type; })[0]; return d ? d.name : (payDefs()[0] || {}).name || ''; }
var INV_STATUS = ['Unsubmitted','Submitted'];
// Rundown segments use the same managed statuses as tasks; older rundown statuses map onto them
var RUNDOWN_STATUS_MIGRATE = { 'Planned': 'Not Started', 'Confirmed': 'Done', 'Changed': 'Pending', 'Cancelled': 'Pending' };
// Festival Flow rundown (from the Figma "GX 27 Festival Flow" page) is built into the code so it can never go missing
var FLOW_SEED = window.GX27_FLOW_SEED || {
  meta: { title: 'GX 27 Festival Flow', subtitle: 'Main program dan aktivitas paralel dalam satu alur festival.', openGate: '09:00', close: '20:00', source: 'Figma · Festival Run of Show' },
  zones: [
    { id: 'Z01', kind: 'activity', order: 1, name: 'GX Fortune', time: '10:00–16:00', location: 'Lt. 3', detail: 'Tarot Reading · Lt. 3' },
    { id: 'Z02', kind: 'activity', order: 2, name: 'GX Festival Experience', time: 'Start 09:00', location: 'Basement', detail: 'Basement · 09:00–10:00 — DJ Pop-Up\nBasement · 09:00–17:00 — DIY Merch Activation · Tenant\nBasement · 09:00–19:00 — Wall of Wishes · Tin Can Ball Toss · Ring Toss' },
    { id: 'Z03', kind: 'activity', order: 3, name: 'GX Experience Zone', time: '10:00–17:00', location: 'Pak X Parking Spot', detail: 'People of GX Frame (Team Building GX Connect) · Voting: Guest Participation · Glambot Video · Photobooth · Face Painting' },
    { id: 'Z04', kind: 'activity', order: 4, name: 'GX Game Zone', time: 'Start 10:00', location: 'Lt. 3', detail: 'Lt. 3 · 10:00–19:00 — Falling Stick · Zig Zag · Axe Throwing · Counter Balance · Mini Golf · Buzzer Wire · Race Simulator\nLt. 3 · 10:00–16:00 — Scream Meter · Basketball · DingDong' },
    { id: 'Z11', kind: 'area', order: 1, name: 'GX Festival Experience', time: '', location: 'Basement', detail: 'DJ Pop-Up · DIY Merch · Tenant · Wall of Wishes Until 19:00 · Tin Can Ball Toss · Ring Toss' },
    { id: 'Z12', kind: 'area', order: 2, name: 'GX Experience Zone', time: '', location: 'Pak X Parking Spot', detail: 'People of GX Frame (Team Building GX Connect) · Voting: Guest Participation · Glambot Video · Photobooth · Face Painting' },
    { id: 'Z13', kind: 'area', order: 3, name: 'Main Stage', time: '', location: 'Lt. 1', detail: 'Main Ceremony · Performances · Awards · Guest Star' },
    { id: 'Z14', kind: 'area', order: 4, name: 'Food Booth', time: '', location: 'Lt. 1 Parking + Lt. 2', detail: 'Food Booth Lt. 1 Parking Area · Food Booth Lt. 2' },
    { id: 'Z15', kind: 'area', order: 5, name: 'GX Game Zone', time: '', location: 'Lt. 3', detail: 'GX Game Zone · Tarot Reading / GX Fortune' },
    { id: 'Z16', kind: 'area', order: 6, name: 'HYROX Challenge', time: '', location: 'Lt. 4', detail: 'HYROX Competition · Winner Podium · Open Hour' }
  ],
  items: [
    { id: 'RF01', start: '09:00', end: '10:00', segment: 'Open Gate', location: 'GX Festival Experience · Basement', flow: 'GX Access Point Arrival · Registration · Ticket · GX Festival Experience · DJ Pop-Up', concurrent: ['Only GX Festival Experience Active', 'Continues Until 17:00'] },
    { id: 'RF02', start: '10:00', end: '12:00', segment: 'GX 27 Anniversary Ceremony', location: 'Main Stage', flow: 'Opening, Ceremony, Awards, dan Lunch Bridge.', concurrent: ['GX Festival Experience', 'GX Experience Zone Until 17:00', 'GX Fortune', 'GX Game Zone'] },
    { id: 'RF03', start: '12:00', end: '13:30', segment: 'Lunch Break + Spectrum', location: 'Food Booth · Lt. 1 + Lt. 2 Parking Area', flow: 'Lunch Service · Spectrum Performance', concurrent: ['GX Festival Experience', 'GX Experience Zone Until 17:00', 'GX Fortune', 'GX Game Zone'] },
    { id: 'RF04', start: '13:30', end: '14:00', segment: 'Mini Games — Tebak Lagu', location: 'Main Stage', flow: 'Crowd Recall · Tebak Lagu · GX Got Talent Next at 14:00', concurrent: ['GX Festival Experience', 'GX Experience Zone Until 17:00', 'GX Fortune', 'GX Game Zone'] },
    { id: 'RF05', start: '14:00', end: '15:15', segment: 'GX Got Talent', location: 'Main Stage', flow: 'Talent Performances · Doorprize Session · Talent Wrap', concurrent: ['GX Festival Experience', 'GX Experience Zone Until 17:00', 'GX Fortune', 'GX Game Zone Lt. 3'] },
    { id: 'RF06', start: '15:15', end: '15:30', segment: 'Prepare HYROX', location: 'Multi Area', flow: 'MC Info: HYROX Lt. 4 · Mobile Legends Battle for 1st & 2nd Place at Main Stage', concurrent: ['HYROX Check-In', 'ML Player Standby', 'Optional Tebak Hero After ML Winner'] },
    { id: 'RF07', start: '15:30', end: '17:30', segment: 'HYROX Challenge', location: 'Lt. 4', flow: 'Challenge → Winner Podium → DJ Pop-Up', concurrent: [] },
    { id: 'RF08', start: '15:30', end: '17:30', segment: 'Mobile Legends', location: 'Main Stage', flow: 'Battle for 1st & 2nd Place → Winner → Optional Tebak Hero', concurrent: [] },
    { id: 'RF09', start: '15:30', end: '17:30', segment: 'Festival Activations', location: 'Multi Area', flow: 'GX Festival Experience · GX Experience Zone · GX Game Zone Lt. 3 · GX Fortune', concurrent: [] },
    { id: 'RF10', start: '17:30', end: '18:30', segment: 'Concurrent — HYROX Open Hour', location: 'Lt. 4', flow: 'Free Try · HYROX Participant Break', concurrent: ['HYROX Continues Normally', 'Lt. 4 TV — Main Stage Feed: Grand Doorprize · GX Connect Winners · GX Got Talent Winners'] },
    { id: 'RF11', start: '17:30', end: '18:00', segment: 'Grand Doorprize', location: 'Main Stage', flow: 'Grand Doorprize Draw · Winner Announcement · Handover', concurrent: ['HYROX Continues at Lt. 4 · Main Stage Feed on Lt. 4 TV'] },
    { id: 'RF12', start: '18:00', end: '18:20', segment: 'GX Connect + GX Got Talent Winners', location: 'Main Stage', flow: 'Winner Announcement · Handover', concurrent: ['HYROX Continues at Lt. 4 · Main Stage Feed on Lt. 4 TV'] },
    { id: 'RF13', start: '18:20', end: '18:30', segment: 'Maghrib Break', location: 'Main Stage + Prayer Area', flow: 'Prayer Break · Final Stage Check', concurrent: ['Low-Volume Ambient BGM Stays On', 'No MC, Announcements, or Loud Music', 'Resume at 18:30'] },
    { id: 'RF14', start: '18:30', end: '18:45', segment: 'Final Grand Doorprize + Closing MC', location: 'Main Stage', flow: 'Final Doorprize · Closing · Not So Koplo Welcome', concurrent: ['Final Draw · Winner Handover · Stage Clear'] },
    { id: 'RF15', start: '18:45', end: '19:45', segment: 'Not So Koplo', location: 'Main Stage', flow: 'Guest Star Performance · Final Celebration', concurrent: ['Game Zone Closes 19:00'] },
    { id: 'RF16', start: '19:45', end: '19:50', segment: 'Final Farewell', location: 'Main Stage', flow: 'Thank You · Audience Exit', concurrent: [] }
  ]
};
function flowSeedItems() {
  return JSON.parse(JSON.stringify(FLOW_SEED.items || [])).map(function (r, i) {
    return Object.assign({ order: i + 1, duration: '', mcCue: '', av: '', ops: '', docs: '', pic: '', status: defaultStatus(), source: 'confirmed', verifyNote: '' }, r, { group: 'flow' });
  });
}
function rundownSeed() { return flowSeedItems(); }
function zonesSeed() { return JSON.parse(JSON.stringify(FLOW_SEED.zones || [])); }
function taskCategories() { return (db.settings.taskCategories || []).slice(); }
var WS_CLASS = {'GX Connect':'connect','GX Got Talent':'ggt','Mobile Legends':'ml','HYROX':'hyrox','Event Day':'event'};
// every category gets its own colour: the 4 programs keep theirs, the rest take the next colour from this palette
var WS_FIXED = { connect: ['#5B2EA6', '#EEE6FB'], ggt: ['#9C2B22', '#FBE5E1'], ml: ['#2440A0', '#E3E9FB'], hyrox: ['#1E6B3A', '#E1F4E7'], event: ['#1A1A17', '#FFF4C2'] };
var WS_PALETTE = [
  ['#0F6E6E', '#DDF3F1'], ['#A14A00', '#FDEBDB'], ['#A3215F', '#FBE3EF'], ['#5C6B00', '#EEF3D2'], ['#0B5E8E', '#DDEFFA'], ['#7A4B1E', '#F3E8DC'],
  ['#3D3FA8', '#E6E7FA'], ['#8A6A00', '#FBF0C9'], ['#8E2E9E', '#F5E2F8'], ['#2E6B4F', '#DFF0E7'], ['#B23A3A', '#FBE4E4'], ['#006D8F', '#D9F1F8'],
  ['#C2410C', '#FFE8D9'], ['#6D28D9', '#EDE4FD'], ['#047857', '#D8F5EA'], ['#BE185D', '#FCE1EE'], ['#1D4ED8', '#E0E9FD'], ['#78350F', '#F6E9D7'],
  ['#4D7C0F', '#E8F4D3'], ['#9D174D', '#F9DDE9'], ['#155E75', '#DAF0F6'], ['#92400E', '#FDECCB'], ['#5B21B6', '#EAE2FB'], ['#065F46', '#D5F2E6']
];
/* v12: a renamed workstream keeps its identity (colour, program status on the Master Timeline).
   settings.wsOrigin maps current name -> original name; settings.wsColorIdx maps original name -> palette slot,
   so colours also stay put when the list is reordered. */
function wsBase(ws) { var m = db && db.settings && db.settings.wsOrigin; return (m && m[ws]) || ws; }
function wsCurrent(base) {
  var m = (db && db.settings && db.settings.wsOrigin) || {};
  for (var k in m) if (m[k] === base) return k;
  return base;
}
function wsColorSlots(s) {
  var map = s.wsColorIdx = (s.wsColorIdx && typeof s.wsColorIdx === 'object' && !Array.isArray(s.wsColorIdx)) ? s.wsColorIdx : {};
  var org = s.wsOrigin || {}, used = {}, k;
  for (k in map) used[map[k]] = 1;
  (s.workstreams || []).forEach(function (w) {
    var b = org[w] || w; if (WS_CLASS[b] || map[b] != null) return;
    var i = 0; while (used[i]) i++;
    map[b] = i; used[i] = 1;
  });
}
function wsColor(ws) {
  var b = wsBase(ws);
  if (WS_CLASS[b]) return WS_FIXED[WS_CLASS[b]];
  var map = db && db.settings && db.settings.wsColorIdx, i = map ? map[b] : null;
  if (i == null) { i = 0; for (var k = 0; k < String(b || '').length; k++) i = (i * 31 + String(b).charCodeAt(k)) % 997; }
  return WS_PALETTE[i % WS_PALETTE.length];
}

/* ================= Seed data ================= */
// Budget data from sheet "EDIT DISINI" (Divisi Acara), built into the code so Finance is never empty.
// Regenerate with: python3 scripts/build_seed.py <file.xlsx>
var SHEET_SEED = /*BUDGET_SEED_START*/{"meta": {"sheet": "EDIT DISINI", "division": "Acara", "rows": "3–79", "snapshot": "2026-10-12", "file": "Budgeting_Anniv_GX_27TH_1.xlsx", "hash": "8084f60c8381", "sheetSubTotal": 204280139, "sheetTransferred": 77636370, "sheetRemaining": 126643769, "url": "https://docs.google.com/spreadsheets/d/1-6E2tecKu3eUOzAKM1xRfm7rfmjFb-ynQYEhlvz_K6w/edit"}, "items": [{"key": "ojisan", "parent": null, "sheetRow": 3, "item": "OJISAN — Kodak + Soft/Hard Copy Printing", "workstream": "GX Connect", "qty": null, "unit": "", "unitCost": null, "estimated": null, "invoice": 10020000, "dp": null, "fee": 5000, "paidAmount": 10020000, "paymentDeadline": "", "invoiceStatus": "Submitted", "paymentStatus": "Full Paid", "receipt": "Full Payment Kodak", "invoiceRef": "Kodak HD Power Flash Single-Use Camera ISO 800 39 Exposures + Scan .pdf", "notes": "OJISAN\n\n• Kamera: ready stock.\n• Proses develop, scan, print/cetak untuk 20 kamera membutuhkan waktu ±1 hari.", "kind": "vendor", "task": "Procurement · GX Connect (Kodak, print, frame, cash fund)", "source": "confirmed", "verifyNote": "INV Total baris 3 (10.020.000) = Kodak + Printing, jadi dicatat sebagai satu invoice vendor."}, {"key": null, "parent": "ojisan", "sheetRow": 3, "item": "Kodak", "workstream": "GX Connect", "qty": 22, "unit": "Pcs", "unitCost": 360000, "estimated": 7920000, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Pending Payment", "receipt": "", "invoiceRef": "", "notes": "", "kind": "", "task": null, "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": "ojisan", "sheetRow": 4, "item": "Soft Copy & Hard Copy Printing", "workstream": "GX Connect", "qty": 20, "unit": "Pcs", "unitCost": 105000, "estimated": 2100000, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Pending Payment", "receipt": "", "invoiceRef": "", "notes": "Landscape", "kind": "", "task": null, "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": null, "sheetRow": 5, "item": "Frame / Corkboard 40x60 cm", "workstream": "GX Connect", "qty": 21, "unit": "Pcs", "unitCost": 150000, "estimated": 3150000, "invoice": 2548620, "dp": null, "fee": null, "paidAmount": 2548620, "paymentDeadline": "", "invoiceStatus": "Submitted", "paymentStatus": "Full Paid", "receipt": "Full Payment Shopee Frame", "invoiceRef": "Frame Corkboard", "notes": "Kolom Pelunasan: Full Payment", "kind": "", "task": "Procurement · GX Connect (Kodak, print, frame, cash fund)", "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": null, "sheetRow": 6, "item": "Decoration Cash Fund / Team", "workstream": "GX Connect", "qty": 20, "unit": "Pcs", "unitCost": 100000, "estimated": 2000000, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Submitted", "paymentStatus": "Pending Payment", "receipt": "", "invoiceRef": "", "notes": "Cash · Kolom Pelunasan: Full Payment", "kind": "", "task": "Procurement · GX Connect (Kodak, print, frame, cash fund)", "source": "verify", "verifyNote": "Kolom Pelunasan \"Full Payment\" tapi Payment Status \"Submitted\" — konfirmasi sudah dibayar atau belum."}, {"key": null, "parent": null, "sheetRow": 7, "item": "Wristband Kertas", "workstream": "GX Access Point", "qty": 750, "unit": "Pack", "unitCost": 1500, "estimated": 1125000, "invoice": 750000, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Submitted", "paymentStatus": "Pending Payment", "receipt": "", "invoiceRef": "INV Gelang + Kartu Game", "notes": "", "kind": "", "task": "Paper wristbands", "source": "verify", "verifyNote": "Invoice 750.000 diambil dari kolom Note (angka). Invoice gabungan \"INV Gelang + Kartu Game\"."}, {"key": null, "parent": null, "sheetRow": 8, "item": "Cetak Card", "workstream": "GX Game Pass", "qty": 700, "unit": "Pcs", "unitCost": 10000, "estimated": 7000000, "invoice": 1187500, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Submitted", "paymentStatus": "Pending Payment", "receipt": "", "invoiceRef": "INV Gelang + Kartu Game", "notes": "Kartu Game: 1.187.500 · Sisa: 5.812.500 → diambil untuk budget Rider 2.800.000 (TF ke Mandiri HC a.n. PT IMAM\n[no. rek. disembunyikan — lihat sheet]) (status baris 9: Submitted)", "kind": "", "task": "Procurement · GX Game Pass (card & stamp)", "source": "verify", "verifyNote": "Invoice 1.187.500 diambil dari kolom Note. Invoice gabungan \"INV Gelang + Kartu Game\"."}, {"key": null, "parent": null, "sheetRow": 10, "item": "Stamp", "workstream": "GX Game Pass", "qty": 15, "unit": "Pcs", "unitCost": 80000, "estimated": 1200000, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Pending Payment", "receipt": "", "invoiceRef": "", "notes": "", "kind": "", "task": "Procurement · GX Game Pass (card & stamp)", "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": null, "sheetRow": 11, "item": "Budget Top 5 Team", "workstream": "GX Got Talent", "qty": 5, "unit": "Pack", "unitCost": 1000000, "estimated": 5000000, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Pending Payment", "receipt": "", "invoiceRef": "", "notes": "", "kind": "", "task": "GX Got Talent · Budget Top 5 Team", "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": null, "sheetRow": 12, "item": "DIY Totebag", "workstream": "Activation", "qty": 1, "unit": "Pack", "unitCost": 5000000, "estimated": 5000000, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Submitted", "paymentStatus": "Pending Payment", "receipt": "", "invoiceRef": "Mini Heat Press", "notes": "1 pcs mini heat press : Rp 291.167", "kind": "", "task": "DIY tote bag design & package", "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": null, "sheetRow": 13, "item": "Sticker DTF", "workstream": "Activation", "qty": null, "unit": "", "unitCost": null, "estimated": null, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Pending Payment", "receipt": "", "invoiceRef": "", "notes": "", "kind": "", "task": "DTF sticker design", "source": "verify", "verifyNote": "Baris 13 hanya berisi \"Sticker DTF:\" di kolom Note, tanpa nominal."}, {"key": null, "parent": null, "sheetRow": 14, "item": "Face Painting", "workstream": "Activation", "qty": 6, "unit": "Pack", "unitCost": 950000, "estimated": 5700000, "invoice": 4200000, "dp": 2100000, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Submitted", "paymentStatus": "DP Paid", "receipt": "DP Face Painting", "invoiceRef": "Invoice Face Painting", "notes": "", "kind": "", "task": "Vendor · Face Painting & Tarot Reader", "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": null, "sheetRow": 15, "item": "Tarot Reader", "workstream": "Activation", "qty": 6, "unit": "Pack", "unitCost": 312500, "estimated": 1875000, "invoice": 1875000, "dp": 937500, "fee": 2500, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Submitted", "paymentStatus": "DP Paid", "receipt": "DP Tarot", "invoiceRef": "Invoice Tarot", "notes": "", "kind": "", "task": "Vendor · Face Painting & Tarot Reader", "source": "confirmed", "verifyNote": ""}, {"key": "bali", "parent": null, "sheetRow": 16, "item": "Bali Games Rental", "workstream": "Games", "qty": null, "unit": "", "unitCost": null, "estimated": null, "invoice": 5750500, "dp": 2875250, "fee": 2500, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Submitted", "paymentStatus": "DP Paid", "receipt": "DP Bali Games Rental", "invoiceRef": "Bali Games Rental Invoice.pdf", "notes": "DP 50%", "kind": "vendor", "task": "Bali Games rental coordination", "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": "bali", "sheetRow": 17, "item": "Falling stick game", "workstream": "Games", "qty": 1, "unit": "Pack", "unitCost": 1000000, "estimated": 1000000, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Pending Payment", "receipt": "", "invoiceRef": "", "notes": "", "kind": "", "task": null, "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": "bali", "sheetRow": 18, "item": "Axe throwing", "workstream": "Games", "qty": 1, "unit": "Pack", "unitCost": 500000, "estimated": 500000, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Pending Payment", "receipt": "", "invoiceRef": "", "notes": "", "kind": "", "task": null, "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": "bali", "sheetRow": 19, "item": "Zig zag game", "workstream": "Games", "qty": 1, "unit": "Pack", "unitCost": 700000, "estimated": 700000, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Pending Payment", "receipt": "", "invoiceRef": "", "notes": "", "kind": "", "task": null, "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": "bali", "sheetRow": 20, "item": "Counter balance", "workstream": "Games", "qty": 1, "unit": "Pack", "unitCost": 750000, "estimated": 750000, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Pending Payment", "receipt": "", "invoiceRef": "", "notes": "", "kind": "", "task": null, "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": "bali", "sheetRow": 21, "item": "Buzz wire", "workstream": "Games", "qty": 1, "unit": "Pack", "unitCost": 750000, "estimated": 750000, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Pending Payment", "receipt": "", "invoiceRef": "", "notes": "", "kind": "", "task": null, "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": "bali", "sheetRow": 22, "item": "Mini golf", "workstream": "Games", "qty": 1, "unit": "Pack", "unitCost": 850000, "estimated": 850000, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Pending Payment", "receipt": "", "invoiceRef": "", "notes": "", "kind": "", "task": null, "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": "bali", "sheetRow": 23, "item": "Man Power", "workstream": "Games", "qty": 1, "unit": "Pack", "unitCost": 300000, "estimated": 300000, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Pending Payment", "receipt": "", "invoiceRef": "", "notes": "", "kind": "", "task": null, "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": "bali", "sheetRow": 24, "item": "Branding", "workstream": "Games", "qty": 1, "unit": "Pack", "unitCost": 400000, "estimated": 400000, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Pending Payment", "receipt": "", "invoiceRef": "", "notes": "", "kind": "", "task": null, "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": "bali", "sheetRow": 25, "item": "Taxes", "workstream": "Games", "qty": 1, "unit": "Pack", "unitCost": 500500, "estimated": 500500, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Pending Payment", "receipt": "", "invoiceRef": "", "notes": "", "kind": "", "task": null, "source": "confirmed", "verifyNote": ""}, {"key": "bumi", "parent": null, "sheetRow": 26, "item": "BUMI Creative", "workstream": "Games", "qty": null, "unit": "", "unitCost": null, "estimated": null, "invoice": 29500000, "dp": 14750000, "fee": 2500, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Submitted", "paymentStatus": "DP Paid", "receipt": "DP BUMI Games", "invoiceRef": "BUMI Creative Quotation", "notes": "DP 50%", "kind": "vendor", "task": "BUMI Creative game equipment coordination", "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": "bumi", "sheetRow": 27, "item": "Scream Meter", "workstream": "Games", "qty": 1, "unit": "Pack", "unitCost": 6000000, "estimated": 6000000, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Pending Payment", "receipt": "", "invoiceRef": "", "notes": "Half day", "kind": "", "task": null, "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": "bumi", "sheetRow": 28, "item": "Race simulator", "workstream": "Games", "qty": 1, "unit": "Pack", "unitCost": 12000000, "estimated": 12000000, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Pending Payment", "receipt": "", "invoiceRef": "", "notes": "Full day", "kind": "", "task": null, "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": "bumi", "sheetRow": 29, "item": "Basket ball game", "workstream": "Games", "qty": 1, "unit": "Pack", "unitCost": 7000000, "estimated": 7000000, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Pending Payment", "receipt": "", "invoiceRef": "", "notes": "Half day", "kind": "", "task": null, "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": "bumi", "sheetRow": 30, "item": "Dingdong arcade", "workstream": "Games", "qty": 1, "unit": "Pack", "unitCost": 4500000, "estimated": 4500000, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Pending Payment", "receipt": "", "invoiceRef": "", "notes": "Half day", "kind": "", "task": null, "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": null, "sheetRow": 31, "item": "Hyrox (Full Service)+ppn", "workstream": "Competition", "qty": 1, "unit": "Pack", "unitCost": 44400000, "estimated": 44400000, "invoice": 40000000, "dp": 20000000, "fee": 2500, "paidAmount": null, "paymentDeadline": "2026-11-14", "invoiceStatus": "Submitted", "paymentStatus": "DP Paid", "receipt": "DP Hyrox", "invoiceRef": "ULTRAFIT-Invoice-GlobalXtreme-Anniversary-Race-2.pdf", "notes": "Need Payment Asap DP 50% > 20 juta\n\nPelunasan latest by 14 November", "kind": "", "task": "Vendor · HYROX full service (Ultrafit)", "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": null, "sheetRow": 32, "item": "Spectrum Band", "workstream": "Entertainment", "qty": 1, "unit": "Pax", "unitCost": 16000000, "estimated": 16000000, "invoice": 16000000, "dp": 8000000, "fee": 2500, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Submitted", "paymentStatus": "DP Paid", "receipt": "DP Spectrum", "invoiceRef": "INVOICE 21 NOVEMBER 2026.pdf", "notes": "Need Payment Asap DP 50% > 8 juta", "kind": "", "task": "Vendor · Entertainment (band, MC, DJ)", "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": null, "sheetRow": 33, "item": "Not So Koplo", "workstream": "Entertainment", "qty": 1, "unit": "Pax", "unitCost": 5000000, "estimated": 5000000, "invoice": 3500000, "dp": 1750000, "fee": 2500, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Submitted", "paymentStatus": "DP Paid", "receipt": "DP Not So Koplo", "invoiceRef": "Invoice NSK to GlobalXtreme Bali.pdf", "notes": "Need Payment ASAP\nDP 50% > 1.750 jt", "kind": "", "task": "Vendor · Entertainment (band, MC, DJ)", "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": null, "sheetRow": 34, "item": "MC - The Palbis", "workstream": "Entertainment", "qty": 1, "unit": "Pax", "unitCost": 9000000, "estimated": 9000000, "invoice": 8000000, "dp": 4000000, "fee": 2500, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Submitted", "paymentStatus": "DP Paid", "receipt": "DP MC The Palbis", "invoiceRef": "INV THE PALBIS - 21 NOV 26.pdf", "notes": "Include riders hospitality  - 1jt \nDP 50% > 4 juta", "kind": "", "task": "Vendor · Entertainment (band, MC, DJ)", "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": null, "sheetRow": 35, "item": "DJ (Basement)", "workstream": "Entertainment", "qty": 3, "unit": "Pax", "unitCost": 1185000, "estimated": 3555000, "invoice": 3500000, "dp": 1750000, "fee": 2500, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Submitted", "paymentStatus": "DP Paid", "receipt": "DP DJ Bestman", "invoiceRef": "Invoice DJ Bestman GX27.pdf", "notes": "3 jam", "kind": "", "task": "Vendor · Entertainment (band, MC, DJ)", "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": null, "sheetRow": 36, "item": "Foamboard", "workstream": "Winners", "qty": 27, "unit": "Pcs", "unitCost": 50000, "estimated": 1350000, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Pending Payment", "receipt": "", "invoiceRef": "", "notes": "", "kind": "", "task": "Winners & Xtreme Award landscape foamboards", "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": null, "sheetRow": 37, "item": "GX Connect - People's Choice", "workstream": "Hadiah Lomba dan Team Building", "qty": 1, "unit": "Pax", "unitCost": 1000000, "estimated": 1000000, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Pending Payment", "receipt": "", "invoiceRef": "", "notes": "", "kind": "", "task": "Hadiah pemenang lomba & team building", "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": null, "sheetRow": 38, "item": "GX Connect - Most Engaging", "workstream": "Hadiah Lomba dan Team Building", "qty": 1, "unit": "Pax", "unitCost": 2000000, "estimated": 2000000, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Pending Payment", "receipt": "", "invoiceRef": "", "notes": "", "kind": "", "task": "Hadiah pemenang lomba & team building", "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": null, "sheetRow": 39, "item": "GX Connect - Champion", "workstream": "Hadiah Lomba dan Team Building", "qty": 1, "unit": "Pax", "unitCost": 3000000, "estimated": 3000000, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Pending Payment", "receipt": "", "invoiceRef": "", "notes": "", "kind": "", "task": "Hadiah pemenang lomba & team building", "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": null, "sheetRow": 40, "item": "Got Talent Juara 1", "workstream": "Hadiah Lomba dan Team Building", "qty": 1, "unit": "Pax", "unitCost": 3000000, "estimated": 3000000, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Pending Payment", "receipt": "", "invoiceRef": "", "notes": "", "kind": "", "task": "Hadiah pemenang lomba & team building", "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": null, "sheetRow": 41, "item": "Got Talent Juara 2", "workstream": "Hadiah Lomba dan Team Building", "qty": 1, "unit": "Pax", "unitCost": 2000000, "estimated": 2000000, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Pending Payment", "receipt": "", "invoiceRef": "", "notes": "", "kind": "", "task": "Hadiah pemenang lomba & team building", "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": null, "sheetRow": 42, "item": "Got Talent Juara 3", "workstream": "Hadiah Lomba dan Team Building", "qty": 1, "unit": "Pax", "unitCost": 1000000, "estimated": 1000000, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Pending Payment", "receipt": "", "invoiceRef": "", "notes": "", "kind": "", "task": "Hadiah pemenang lomba & team building", "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": null, "sheetRow": 43, "item": "Hyrox 1", "workstream": "Hadiah Lomba dan Team Building", "qty": 1, "unit": "Pax", "unitCost": 1500000, "estimated": 2000000, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Pending Payment", "receipt": "", "invoiceRef": "", "notes": "", "kind": "", "task": "Hadiah pemenang lomba & team building", "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": null, "sheetRow": 44, "item": "Hyrox 2", "workstream": "Hadiah Lomba dan Team Building", "qty": 1, "unit": "Pax", "unitCost": 1000000, "estimated": 1000000, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Pending Payment", "receipt": "", "invoiceRef": "", "notes": "", "kind": "", "task": "Hadiah pemenang lomba & team building", "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": null, "sheetRow": 45, "item": "Hyrox 3", "workstream": "Hadiah Lomba dan Team Building", "qty": 1, "unit": "Pax", "unitCost": 500000, "estimated": 500000, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Pending Payment", "receipt": "", "invoiceRef": "", "notes": "", "kind": "", "task": "Hadiah pemenang lomba & team building", "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": null, "sheetRow": 46, "item": "Mobile Legend 1", "workstream": "Hadiah Lomba dan Team Building", "qty": 1, "unit": "Pax", "unitCost": 2000000, "estimated": 2000000, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Pending Payment", "receipt": "", "invoiceRef": "", "notes": "", "kind": "", "task": "Hadiah pemenang lomba & team building", "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": null, "sheetRow": 47, "item": "Mobile Legend 2", "workstream": "Hadiah Lomba dan Team Building", "qty": 1, "unit": "Pax", "unitCost": 1000000, "estimated": 1000000, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Pending Payment", "receipt": "", "invoiceRef": "", "notes": "", "kind": "", "task": "Hadiah pemenang lomba & team building", "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": null, "sheetRow": 48, "item": "Mobile Legend 3", "workstream": "Hadiah Lomba dan Team Building", "qty": 1, "unit": "Pax", "unitCost": 500000, "estimated": 500000, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Pending Payment", "receipt": "", "invoiceRef": "", "notes": "", "kind": "", "task": "Hadiah pemenang lomba & team building", "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": null, "sheetRow": 49, "item": "Mini Games", "workstream": "Hadiah Lomba dan Team Building", "qty": null, "unit": "", "unitCost": null, "estimated": null, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Pending Payment", "receipt": "", "invoiceRef": "", "notes": "Dana Lain-Lain", "kind": "", "task": "Hadiah pemenang lomba & team building", "source": "confirmed", "verifyNote": ""}, {"key": "door", "parent": null, "sheetRow": 50, "item": "Doorprize — dana dicairkan ke rekening Marketing (belanja Shopee)", "workstream": "Doorprize", "qty": null, "unit": "", "unitCost": null, "estimated": null, "invoice": 8880000, "dp": null, "fee": null, "paidAmount": 8880000, "paymentDeadline": "", "invoiceStatus": "Submitted", "paymentStatus": "Full Paid", "receipt": "Full Payment Doorprize ke Rek MKT\n\nRealisasi Full Payment Shopee Doorprize", "invoiceRef": "", "notes": "Pembelian semuanya di shopee langsung kirim ke kantor GX\ndikarenakan ada discount dan lebih murah\nTotal : 8jt\nPakai VA BCA? TBA \n[no. VA disembunyikan — lihat sheet]\n\nDana 8.880.000 dicairkan ke rekening Marketing", "kind": "vendor", "task": "Doorprize procurement", "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": "door", "sheetRow": 51, "item": "Smart TV Xiaomi  43\"", "workstream": "Doorprize", "qty": 1, "unit": "Pcs", "unitCost": 3039080, "estimated": 3039080, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Full Paid", "receipt": "", "invoiceRef": "", "notes": "", "kind": "", "task": null, "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": "door", "sheetRow": 52, "item": "Dispenser Galon Bawah Cosmos", "workstream": "Doorprize", "qty": 1, "unit": "Pcs", "unitCost": 1500000, "estimated": 1319338, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Full Paid", "receipt": "", "invoiceRef": "", "notes": "", "kind": "", "task": null, "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": "door", "sheetRow": 53, "item": "Mesin Kopi", "workstream": "Doorprize", "qty": 1, "unit": "Pcs", "unitCost": 1271861, "estimated": 1271861, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Full Paid", "receipt": "", "invoiceRef": "", "notes": "", "kind": "", "task": null, "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": "door", "sheetRow": 54, "item": "Airfryer 4.2L Philips", "workstream": "Doorprize", "qty": 1, "unit": "Pcs", "unitCost": 788018, "estimated": 788018, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Full Paid", "receipt": "", "invoiceRef": "", "notes": "", "kind": "", "task": null, "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": "door", "sheetRow": 55, "item": "Smartwatch Xiaomi Band 11", "workstream": "Doorprize", "qty": 1, "unit": "Pcs", "unitCost": 499000, "estimated": 499000, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Full Paid", "receipt": "", "invoiceRef": "", "notes": "", "kind": "", "task": null, "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": "door", "sheetRow": 57, "item": "Kompor Listrik AZKO", "workstream": "Doorprize", "qty": 1, "unit": "Pcs", "unitCost": 229900, "estimated": 229900, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Full Paid", "receipt": "", "invoiceRef": "", "notes": "4–6 Tahun — 7 Doorprize ·", "kind": "", "task": null, "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": "door", "sheetRow": 58, "item": "Panasonic Airpurifier", "workstream": "Doorprize", "qty": 1, "unit": "Pcs", "unitCost": 169000, "estimated": 169000, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Full Paid", "receipt": "", "invoiceRef": "", "notes": "4–6 Tahun — 7 Doorprize ·", "kind": "", "task": null, "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": "door", "sheetRow": 59, "item": "Kettle Listrik Informa", "workstream": "Doorprize", "qty": 1, "unit": "Pcs", "unitCost": 164000, "estimated": 164000, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Full Paid", "receipt": "", "invoiceRef": "", "notes": "4–6 Tahun — 7 Doorprize ·", "kind": "", "task": null, "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": "door", "sheetRow": 60, "item": "Setrika Uap", "workstream": "Doorprize", "qty": 1, "unit": "Pcs", "unitCost": 140068, "estimated": 140068, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Full Paid", "receipt": "", "invoiceRef": "", "notes": "4–6 Tahun — 7 Doorprize ·", "kind": "", "task": null, "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": "door", "sheetRow": 61, "item": "Kipas Angin Krisbow", "workstream": "Doorprize", "qty": 1, "unit": "Pcs", "unitCost": 114900, "estimated": 114900, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Full Paid", "receipt": "", "invoiceRef": "", "notes": "4–6 Tahun — 7 Doorprize ·", "kind": "", "task": null, "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": "door", "sheetRow": 62, "item": "TWS Baseus", "workstream": "Doorprize", "qty": 1, "unit": "Pcs", "unitCost": 113501, "estimated": 113501, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Full Paid", "receipt": "", "invoiceRef": "", "notes": "4–6 Tahun — 7 Doorprize ·", "kind": "", "task": null, "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": "door", "sheetRow": 63, "item": "Chopper AZKO", "workstream": "Doorprize", "qty": 1, "unit": "Pcs", "unitCost": 88500, "estimated": 88500, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Full Paid", "receipt": "", "invoiceRef": "", "notes": "4–6 Tahun — 7 Doorprize ·", "kind": "", "task": null, "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": "door", "sheetRow": 65, "item": "Tripod TNW", "workstream": "Doorprize", "qty": 1, "unit": "Pcs", "unitCost": 87196, "estimated": 87196, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Full Paid", "receipt": "", "invoiceRef": "", "notes": "0–3 Tahun — 8 Doorprize ·", "kind": "", "task": null, "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": "door", "sheetRow": 66, "item": "Timbangan Badan Digital Speed", "workstream": "Doorprize", "qty": 1, "unit": "Pcs", "unitCost": 58649, "estimated": 58649, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Full Paid", "receipt": "", "invoiceRef": "", "notes": "0–3 Tahun — 8 Doorprize ·", "kind": "", "task": null, "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": "door", "sheetRow": 67, "item": "Jas Hujan", "workstream": "Doorprize", "qty": 1, "unit": "Pcs", "unitCost": 85043, "estimated": 85043, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Full Paid", "receipt": "", "invoiceRef": "", "notes": "0–3 Tahun — 8 Doorprize ·", "kind": "", "task": null, "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": "door", "sheetRow": 68, "item": "Mini Vacuum Cleaner Philips", "workstream": "Doorprize", "qty": 1, "unit": "Pcs", "unitCost": 97000, "estimated": 97000, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Full Paid", "receipt": "", "invoiceRef": "", "notes": "0–3 Tahun — 8 Doorprize ·", "kind": "", "task": null, "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": "door", "sheetRow": 69, "item": "Tumbler Le Dingding", "workstream": "Doorprize", "qty": 1, "unit": "Pcs", "unitCost": 88147, "estimated": 88147, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Full Paid", "receipt": "", "invoiceRef": "", "notes": "0–3 Tahun — 8 Doorprize ·", "kind": "", "task": null, "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": "door", "sheetRow": 70, "item": "Selimut Unitwo", "workstream": "Doorprize", "qty": 1, "unit": "Pcs", "unitCost": 98900, "estimated": 98900, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Full Paid", "receipt": "", "invoiceRef": "", "notes": "0–3 Tahun — 8 Doorprize ·", "kind": "", "task": null, "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": "door", "sheetRow": 71, "item": "Diffuser Scented", "workstream": "Doorprize", "qty": 1, "unit": "Pcs", "unitCost": 69058, "estimated": 69058, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Full Paid", "receipt": "", "invoiceRef": "", "notes": "0–3 Tahun — 8 Doorprize ·", "kind": "", "task": null, "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": "door", "sheetRow": 72, "item": "Payung Lipat", "workstream": "Doorprize", "qty": 1, "unit": "Pcs", "unitCost": 58480, "estimated": 58480, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Full Paid", "receipt": "", "invoiceRef": "", "notes": "0–3 Tahun — 8 Doorprize ·", "kind": "", "task": null, "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": "door", "sheetRow": 73, "item": "Admin", "workstream": "Doorprize", "qty": 1, "unit": "Pcs", "unitCost": 75000, "estimated": 75000, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Pending Payment", "receipt": "", "invoiceRef": "", "notes": "0–3 Tahun — 8 Doorprize ·", "kind": "", "task": null, "source": "confirmed", "verifyNote": ""}, {"key": "emerg", "parent": null, "sheetRow": 74, "item": "Emergency Fund — Lain-lain", "workstream": "Emergency Fund", "qty": 1, "unit": "Pack", "unitCost": 20000000, "estimated": 20000000, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Pending Payment", "receipt": "", "invoiceRef": "", "notes": "Alokasi dana; pemakaian dicatat sebagai baris di bawahnya.", "kind": "allocation", "task": "Alokasi Emergency Fund", "source": "confirmed", "verifyNote": ""}, {"key": null, "parent": "emerg", "sheetRow": 74, "item": "Mobile Legends — Event Esport Service", "workstream": "Emergency Fund", "qty": null, "unit": "", "unitCost": null, "estimated": null, "invoice": 5000000, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Submitted", "paymentStatus": "Full Paid", "receipt": "Full Payment Mobile Legend", "invoiceRef": "Event Esport Service ( GlobalXtreme).pdf", "notes": "Note sheet: Mobile Legend 5.000.000", "kind": "", "task": null, "source": "verify", "verifyNote": "Nominal 5.000.000 dari kolom Note. Status Full Paid tapi transfer tidak tercatat di kolom DP Total sheet."}, {"key": null, "parent": "emerg", "sheetRow": 75, "item": "Acrylic A4 (Registrasi, Face Painting, DIY)", "workstream": "Emergency Fund", "qty": 3, "unit": "Pcs", "unitCost": null, "estimated": null, "invoice": 156080, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Submitted", "paymentStatus": "Pending Payment", "receipt": "", "invoiceRef": "Acrylic A4", "notes": "3 pcs acrylic A4 (Registrasi, Face Painting, DIY) = Rp 156.080", "kind": "", "task": null, "source": "verify", "verifyNote": "Nominal dari kolom Note."}, {"key": null, "parent": "emerg", "sheetRow": 76, "item": "Anniv Ceremony — Smoke Color Celebration", "workstream": "Emergency Fund", "qty": null, "unit": "", "unitCost": null, "estimated": null, "invoice": 58500, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Submitted", "paymentStatus": "Pending Payment", "receipt": "", "invoiceRef": "Smoke Color Celebration", "notes": "Anniv Cermon | Smoke Color Celebration: Rp58.500", "kind": "", "task": null, "source": "verify", "verifyNote": "Nominal dari kolom Note."}, {"key": null, "parent": "emerg", "sheetRow": 77, "item": "Anniv Ceremony — Air Honk", "workstream": "Emergency Fund", "qty": null, "unit": "", "unitCost": null, "estimated": null, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Pending Payment", "receipt": "", "invoiceRef": "", "notes": "Anniv Cermon | Air Honk:", "kind": "", "task": null, "source": "verify", "verifyNote": "Nominal belum ada di sheet."}, {"key": null, "parent": "emerg", "sheetRow": 78, "item": "Anniv Ceremony — Balon Tepuk", "workstream": "Emergency Fund", "qty": null, "unit": "", "unitCost": null, "estimated": null, "invoice": 1350000, "dp": 675000, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Submitted", "paymentStatus": "Pending Payment", "receipt": "", "invoiceRef": "Invoice Balon Tepuk", "notes": "Anniv Cermon | Balon Tepuk\n\nTotal Invoice: Rp1.350.000\nDP 50%: Rp675.000", "kind": "", "task": null, "source": "verify", "verifyNote": "Invoice & DP 50% dari kolom Note. Status sheet \"Submitted\" → DP dianggap belum dibayar."}, {"key": null, "parent": "emerg", "sheetRow": 79, "item": "Sample Gelang dan Card", "workstream": "Emergency Fund", "qty": null, "unit": "", "unitCost": null, "estimated": null, "invoice": null, "dp": null, "fee": null, "paidAmount": null, "paymentDeadline": "", "invoiceStatus": "Unsubmitted", "paymentStatus": "Pending Payment", "receipt": "", "invoiceRef": "", "notes": "Sample Gelang dan Card", "kind": "", "task": null, "source": "verify", "verifyNote": "Tanpa nominal & status di sheet."}]}/*BUDGET_SEED_END*/;

function seed() {
  var tasks = [], finance = [], n = 0;
  function id(p) { n++; return p + String(n).padStart(3, '0'); }
  function t(ws, name, start, deadline, notes, cat) {
    var o = { id: id('T'), name: name, workstream: ws, category: cat || 'Program Milestone', start: start || '', deadline: deadline,
      pic: '', status: 'Not Started', notes: notes || '', blockers: '', dependencies: '', source: 'confirmed',
      verifyNote: '', createdAt: Date.now(), updatedAt: Date.now() };
    tasks.push(o); return o;
  }
  // Master timeline (confirmed, from "Road to GX 27 — Master Timeline")
  t('GX Connect','Pengumuman & pembagian tim','', '2026-10-05');
  t('GX Got Talent','Launch · Registrasi','2026-10-05','2026-10-11','Registrasi 05–11 OCT');
  t('GX Connect','Technical Meeting','', '2026-10-06','16.00–17.00 WITA');
  t('GX Connect','Photo Hunting · 5 misi tim','2026-10-07','2026-10-21');
  t('GX Got Talent','Technical Meeting','', '2026-10-12','14.00 WITA');
  t('Mobile Legends','Registration Open','', '2026-10-12');
  t('HYROX','Registration Open','', '2026-10-12');
  t('GX Got Talent','Performer preparation & rehearsal','2026-10-15','2026-11-10');
  t('GX Connect','Pengembalian kamera','', '2026-10-22','11.00 WITA');
  t('HYROX','Registration Close','', '2026-10-23','00.00 WITA');
  t('GX Connect','Ambil hasil foto, frame & cash · Mulai People of GX Frame','', '2026-10-24');
  t('GX Connect','Submit 5 misi','2026-10-24','2026-10-26','Deadline 26 OCT, 00.00 WITA');
  t('HYROX','Technical Meeting','', '2026-10-27','16.00–17.00 WITA');
  t('Mobile Legends','Registration Close','', '2026-10-30','00.00 WITA');
  t('GX Got Talent','Audition Schedule Announcement','', '2026-11-01');
  t('GX Connect','Instagram Voting','2026-11-01','2026-11-08','Voting dimulai 01 NOV, berjalan 01–08 NOV');
  t('Mobile Legends','Technical Meeting','', '2026-11-02','16.00–17.00 WITA · PIC / Team Captain');
  t('GX Connect','Voting Close','', '2026-11-08','00.00 WITA');
  t('GX Connect','Final Review + Frame Submission','', '2026-11-09','17.00 WITA');
  t('GX Got Talent','Audition · Golden Ticket Selection','', '2026-11-11','15.00–21.00 WITA');
  t('Mobile Legends','Qualifier Day 1','', '2026-11-12','20.00–22.00 WITA');
  t('GX Got Talent','Top 5 Curation','2026-11-12','2026-11-13');
  t('Mobile Legends','Qualifier Day 2 · Semifinal · 3rd Place Match','', '2026-11-13','20.00–22.00 WITA');
  t('GX Got Talent','Top 5 Main Stage Reveal','', '2026-11-14');
  ['GX Connect Winners','GX Got Talent Top 5','Mobile Legends Grand Final','HYROX Challenge','Anniversary Ceremony'].forEach(function (s) {
    t('Event Day', s, '', EVENT_DATE, 'GX 27 Festival of Connectivity — Event Day', 'Event Day');
  });
  // Preparation task list (confirmed rows from the earlier GX27 Operations "All Tasks" database screenshot)
  var TRUNC = 'Notes terpotong di screenshot sumber — lengkapi teks aslinya.';
  function p(ws, name, d, cat, status, notes, dep, verify) {
    var o = t(ws, name, '', d, notes, cat); o.status = status || 'Not Started'; o.dependencies = dep || '';
    if (verify) { o.source = 'verify'; o.verifyNote = verify; }
    return o;
  }
  p('Design & Production','A4 designs — Registration, Face Art, GX Create','2026-10-13','Production','','Approval desain A4.');
  p('Design & Production','People of GX & GX Game Zone T-Banner foamboards','2026-10-16','Production');
  p('Design & Production','A6 QR voting placeholders for each team','2026-10-16','Production','','20 team voting frames.');
  p('Design & Production','Winners & Xtreme Award landscape foamboards','2026-10-16','Production');
  p('Design & Production','DTF sticker design','2026-10-16','Production','In Progress','Design belum selesai.');
  p('Design & Production','DIY tote bag design & package','2026-10-16','Production','Pending','Menunggu approval Pak X.','Approval Pak X','Nama approver tercatat sebagai "Pak X" — konfirmasi nama aslinya.');
  p('Design & Production','"Wishes for GlobalXtreme" lettering','2026-10-23','Production','','Approve design before productio…','',TRUNC);
  p('Design & Production','Mobile Legends TV still image','2026-10-30','Production','','For Qualifier, Semifinal, 3rd Plac…','',TRUNC);
  p('Design & Production','Print all required foamboards & game vouchers','2026-10-30','Production','','Includes approved Alfamart and …','Final design approvals',TRUNC);
  p('Games & Competition','Finalize rules & winning mechanisms for all games','2026-10-16','Coordination');
  p('Games & Competition','Approve Alfamart voucher — Tebak Lagu','2026-10-20','Coordination');
  p('Games & Competition','Approve Diamond voucher — Tebak Hero','2026-10-20','Coordination');
  p('Games & Competition','Finalize Spin Wheel','2026-10-30','Coordination');
  p('Games & Competition','GX Got Talent judge handouts — Audition & Grand Final','2026-10-30','Production','','','','Judul terpotong di sumber ("Grand Fina…") — dianggap "Grand Final", mohon cek.');
  var OPS = 'Di database lama status operasionalnya tertulis "DP Paid" (itu status pembayaran). Status pembayaran dipindah ke Finance; status operasional perlu dikonfirmasi. Deadline kosong di sumber.';
  var bali = p('Games & Competition','Bali Games rental coordination','','Procurement','','DP 50%. Invoice and transfer re…','Vendor confirmation',OPS + ' ' + TRUNC);
  var bumi = p('Games & Competition','BUMI Creative game equipment coordination','','Procurement','','Scream Meter, Race Simulator, B…','Vendor confirmation',OPS + ' ' + TRUNC);
  p('Procurement','Paper wristbands','2026-10-16','Procurement','Done','Existing record confirms purchas…','',TRUNC);
  // Preparation deadlines (dates confirmed, scope not yet provided)
  PREP_DEADLINES.forEach(function (d) {
    var o = t('Preparation', 'Preparation Deadline · ' + fmtDate(d, true), '', d, '', 'Preparation');
    o.source = 'verify'; o.verifyNote = 'Tanggal confirmed. Lihat task lain dengan deadline yang sama; scope checkpoint ini belum dirinci.';
  });
  var base = { seq: n, tasks: tasks, finance: [] };
  applyBudgetSeed(base);
  n = base.seq; finance = base.finance;
  return { version: 3, seq: n, tasks: tasks, finance: finance, budgetSeedHash: base.budgetSeedHash, financeHashAtSeed: base.financeHashAtSeed, rundown: rundownSeed(), flowMeta: FLOW_SEED.meta, zones: zonesSeed(), flowSeeded: true, meta: SHEET_SEED.meta, settings: JSON.parse(JSON.stringify(SETTINGS_DEFAULT)), savedAt: Date.now() };
}


/* ---------- Budget data from the sheet ---------- */
var BUDGET_TASKS = [
  ['GX Connect', 'Procurement · GX Connect (Kodak, print, frame, cash fund)'], ['GX Game Pass', 'Procurement · GX Game Pass (card & stamp)'],
  ['GX Got Talent', 'GX Got Talent · Budget Top 5 Team'], ['Activation', 'Vendor · Face Painting & Tarot Reader'],
  ['HYROX', 'Vendor · HYROX full service (Ultrafit)'], ['Entertainment', 'Vendor · Entertainment (band, MC, DJ)'],
  ["Winners' Prizes", 'Hadiah pemenang lomba & team building'], ['Doorprize', 'Doorprize procurement'], ['Emergency Fund', 'Alokasi Emergency Fund']
];
/* Capitalization: names in the site use Title Case (small connecting words and units stay lowercase, acronyms like QR/DTF/GX stay as they are) */
var TC_SMALL = { dan: 1, di: 1, ke: 1, dari: 1, untuk: 1, per: 1, yang: 1, atau: 1, dengan: 1, pada: 1, the: 1, of: 1, for: 1, and: 1, to: 1, a: 1, an: 1, in: 1, on: 1, at: 1, vs: 1, by: 1 };
var TC_UNIT = { pcs: 1, pc: 1, pack: 1, pax: 1, kg: 1, gr: 1, cm: 1, mm: 1, m: 1, ml: 1, l: 1, x: 1, rp: 0 };
function titleCase(str) {
  if (!str || typeof str !== 'string') return str;
  var first = true, prevNum = false;
  return str.replace(/[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ']*|\d[\w.,]*/g, function (w, at) {
    if (/^\d/.test(w)) { prevNum = true; first = false; return w; }
    var lower = w === w.toLowerCase(), wasNum = prevNum, isFirst = first;
    prevNum = false; first = false;
    if (!lower) return w;                                        // already has capitals (GX, QR, iPhone, DTF…)
    var prevCh = str.charAt(at - 1);
    if (prevCh === "'" || prevCh === '’') return w;                // People's, Winners'
    if (!isFirst && TC_SMALL[w] && !/[—–:·(\/]\s*$/.test(str.slice(0, at))) return w;
    if (wasNum && TC_UNIT[w]) return w;                          // 750 pcs, 1 pack
    return w.charAt(0).toUpperCase() + w.slice(1);
  });
}
function sameName(a, b) { return String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase(); }
function applyCapsV9(d) {
  var untouched = d.financeHashAtSeed && d.financeHashAtSeed === financeHash(d.finance);
  d.tasks.forEach(function (t) { var n = titleCase(t.name); if (n !== t.name) { t.name = n; } });
  d.finance.forEach(function (f) { var n = titleCase(f.item); if (n !== f.item) { f.item = n; } });
  (d.rundown || []).forEach(function (r) { if (r.segment) r.segment = titleCase(r.segment); });
  (d.zones || []).forEach(function (z) { if (z.name) z.name = titleCase(z.name); });
  if (untouched) d.financeHashAtSeed = financeHash(d.finance);
  d.capsV9 = true;
}
function strHash(str) { var h = 5381; for (var i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }
function financeHash(list) {
  return strHash(JSON.stringify((list || []).map(function (f) { var o = {}; Object.keys(f).sort().forEach(function (k) { if (k !== 'updatedAt' && k !== 'createdAt') o[k] = f[k]; }); return o; })));
}
function budgetSeedHash() { return (SHEET_SEED.meta && SHEET_SEED.meta.hash) || strHash(JSON.stringify(SHEET_SEED.items || [])); }
// Replaces d.finance with the sheet rows. Tasks are kept; missing budget tasks are created; rows link to tasks by name.
function applyBudgetSeed(d) {
  var used = {};
  (d.tasks || []).concat(d.finance || [], d.rundown || [], d.zones || []).forEach(function (x) { used[x.id] = 1; });
  function nid(prefix) { var id; do { d.seq = (d.seq || 0) + 1; id = prefix + String(d.seq).padStart(3, '0'); } while (used[id]); used[id] = 1; return id; }
  var now = Date.now();
  BUDGET_TASKS.forEach(function (x) {
    if (d.tasks.some(function (t) { return sameName(t.name, x[1]); })) return;
    d.tasks.push({ id: nid('T'), name: titleCase(x[1]), workstream: x[0], category: 'Procurement', start: '', deadline: '', pic: '', status: defaultStatus(),
      notes: '', blockers: '', dependencies: '', source: 'verify', verifyNote: 'Task dibuat untuk menampung baris budget di sheet. Deadline, PIC & status operasional belum diberikan.', createdAt: now, updatedAt: now });
  });
  var keyToId = {}, out = [];
  (SHEET_SEED.items || []).forEach(function (r) {
    var f = { id: nid('F') };
    for (var k in r) if (k !== 'key' && k !== 'parent' && k !== 'task') f[k] = r[k];
    if (r.key) keyToId[r.key] = f.id;
    f.parentId = r.parent ? keyToId[r.parent] : null;
    f.item = titleCase(f.item);
    var tk = r.task ? d.tasks.filter(function (x) { return sameName(x.name, r.task); })[0] : null;
    f.taskId = tk ? tk.id : null;
    f.createdAt = f.updatedAt = now;
    out.push(f);
  });
  d.finance = out; d.meta = SHEET_SEED.meta; d.budgetSeedHash = budgetSeedHash(); d.financeHashAtSeed = financeHash(out);
  delete d.financeCleared;
  return d;
}

/* ================= Utilities ================= */
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var MONTHS_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];
function parseISO(s) { if (!s) return null; var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s); if (!m) return null; return new Date(+m[1], +m[2] - 1, +m[3]); }
function toISO(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function todayISO() { return toISO(new Date()); }
function daysBetween(a, b) { return Math.round((parseISO(b) - parseISO(a)) / 864e5); }
function fmtDate(s, short) { var d = parseISO(s); if (!d) return '—'; return String(d.getDate()).padStart(2, '0') + ' ' + MONTHS[d.getMonth()] + (short ? '' : ' ' + d.getFullYear()); }
function fmtDMY(s) { var d = parseISO(s); return d ? String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear() : ''; }
function fmtRange(t) { if (t.start && t.deadline && t.start !== t.deadline) return fmtDate(t.start, true) + ' – ' + fmtDate(t.deadline, true); return fmtDate(t.deadline, true); }
var rpFmt = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });
function rp(n) { return n == null ? '—' : 'Rp ' + rpFmt.format(n); }
function numOrNull(v) { return (v === null || v === undefined || v === '' || isNaN(v)) ? null : Number(v); }
function parseAmount(raw) {
  if (raw == null) return { ok: true, value: null };
  var s = String(raw).trim();
  if (!s || s === '-' || s === '—') return { ok: true, value: null };
  s = s.replace(/rp\.?/i, '').replace(/\s/g, '');
  if (/[^0-9.,\-]/.test(s)) return { ok: false };
  if (/^-/.test(s)) return { ok: false, negative: true };
  // Indonesian "1.500.000" or "1.500.000,50"; English "1,500,000.50"
  var lastDot = s.lastIndexOf('.'), lastComma = s.lastIndexOf(',');
  var dec = null;
  if (lastComma > -1 && lastComma > lastDot && s.length - lastComma - 1 <= 2 && s.split(',').length === 2) dec = ',';
  else if (lastDot > -1 && lastDot > lastComma && s.length - lastDot - 1 <= 2 && s.split('.').length === 2) dec = '.';
  if (dec) { var parts = s.split(dec); s = parts[0].replace(/[.,]/g, '') + '.' + parts[1]; }
  else s = s.replace(/[.,]/g, '');
  var v = Number(s);
  return isNaN(v) ? { ok: false } : { ok: true, value: Math.round(v) };
}
function parseFlexDate(s) {
  if (!s) return '';
  s = String(s).trim(); if (!s) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  var m = /^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/.exec(s);
  if (m) { var y = m[3].length === 2 ? '20' + m[3] : m[3]; return y + '-' + m[2].padStart(2, '0') + '-' + m[1].padStart(2, '0'); }
  var mm = { jan:1,feb:2,mar:3,apr:4,mei:5,may:5,jun:6,jul:7,agu:8,agt:8,aug:8,sep:9,okt:10,oct:10,nov:11,des:12,dec:12 };
  m = /^(\d{1,2})\s+([a-z]{3})[a-z]*\.?\s*(\d{4})?$/i.exec(s);
  if (m && mm[m[2].toLowerCase()]) return (m[3] || '2026') + '-' + String(mm[m[2].toLowerCase()]).padStart(2, '0') + '-' + m[1].padStart(2, '0');
  return null;
}
function wsClass(ws) { return WS_CLASS[wsBase(ws)] || ''; }
function wsTag(ws) { var c = wsColor(ws); return '<span class="ws ' + wsClass(ws) + '" style="color:' + c[0] + ';background:' + c[1] + '">' + esc(ws || '—') + '</span>'; }
function statusBadge(s) {
  var c = 'b-' + (statusDef(s).color || 'neutral');
  return '<span class="badge ' + c + '">' + esc(s) + '</span>';
}
function payBadge(s) { return '<span class="badge b-' + esc(payDef(s).color || 'neutral') + '">' + esc(s) + '</span>'; }
function invBadge(s) { return '<span class="badge ' + (s === 'Submitted' ? 'b-ok' : 'b-neutral') + '">' + esc(s) + '</span>'; }
function srcTag(s) { return s === 'verify' ? '<span class="src verify" title="Needs Verification">Verify</span>' : '<span class="src confirmed" title="Confirmed source data">Confirmed</span>'; }
function opts(list, sel, emptyLabel) {
  var h = emptyLabel != null ? '<option value="">' + esc(emptyLabel) + '</option>' : '';
  return h + list.map(function (v) { var val = typeof v === 'object' ? v.value : v, lab = typeof v === 'object' ? v.label : v; return '<option value="' + esc(val) + '"' + (val === sel ? ' selected' : '') + '>' + esc(lab) + '</option>'; }).join('');
}

/* ================= Store ================= */
var storageOK = true, storageError = '';
var db = normalizeDb({ tasks: [], finance: [] });
function load() {
  try {
    var raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      var d = JSON.parse(raw);
      if (d && Array.isArray(d.tasks) && Array.isArray(d.finance)) return d;
      storageError = 'Saved data was unreadable, so the initial GX27 data was loaded.';
    }
  } catch (e) { storageOK = false; storageError = 'Browser storage is blocked here. Changes will be lost when you refresh.'; }
  var s = seed(); persist(s); return s;
}
function persist(d) {
  d.savedAt = Date.now();
  if (MODE === 'admin') return window.GX27Admin ? window.GX27Admin.markDirty(d) : false;
  if (MODE === 'public') return true;
  try { localStorage.setItem(STORE_KEY, JSON.stringify(d)); return true; }
  catch (e) { storageOK = false; storageError = 'Could not save to browser storage. Changes in this session may be lost on refresh.'; return false; }
}
function commit(msg) {
  if (!canEdit()) { toast('Hanya admin yang bisa mengubah data.', true); return; }
  db = normalizeDb(db);
  var ok = persist(db); render();
  var hint = MODE === 'admin' && !(window.GX27Admin && window.GX27Admin.autoSaveOn && window.GX27Admin.autoSaveOn()) ? ' · klik Save untuk menyimpan ke database' : '';
  if (msg) toast(ok ? msg + hint : 'Change kept for this session only — storage unavailable', !ok);
}
function nextId(prefix) {
  var used = {};
  [db.tasks, db.finance, db.rundown || [], db.zones || []].forEach(function (arr) { arr.forEach(function (x) { used[x.id] = 1; }); });
  var id;
  // the short random tail keeps ids unique when two people add items at the same time on different devices
  var tail = MODE === 'admin' ? '-' + Math.random().toString(36).slice(2, 6) : '';
  do { db.seq = (db.seq || 0) + 1; id = prefix + String(db.seq).padStart(3, '0') + tail; } while (used[id]);
  return id;
}
function taskById(id) { for (var i = 0; i < db.tasks.length; i++) if (db.tasks[i].id === id) return db.tasks[i]; return null; }
function finById(id) { for (var i = 0; i < db.finance.length; i++) if (db.finance[i].id === id) return db.finance[i]; return null; }
function finForTask(id) { return db.finance.filter(function (f) { return f.taskId === id; }); }
// v14: fund allocations (Emergency Fund) — the allocation row a task carries, and the Emergency Fund allocation itself
function allocForTask(t) { return db.finance.filter(function (f) { return f.kind === 'allocation' && f.taskId === t.id; })[0] || null; }
function efAlloc() { return db.finance.filter(function (f) { return f.kind === 'allocation' && wsBase(f.workstream) === 'Emergency Fund'; })[0] || null; }
// link existing Finance & Procurement items to a task (checked = linked to this task)
function linkFinDialog(taskId) {
  var t = taskById(taskId); if (!t) return;
  var list = db.finance.slice().sort(rowOrder);
  var rows = list.map(function (f) {
    var cur = f.taskId ? taskById(f.taskId) : null, mine = f.taskId === t.id;
    return '<label class="lf-row" data-q="' + esc((f.item + ' ' + f.workstream + ' ' + (cur ? cur.name : '')).toLowerCase()) + '"><input type="checkbox" value="' + f.id + '"' + (mine ? ' checked' : '') + '>' +
      '<span class="lf-main"><b>' + esc(f.item || '(tanpa nama)') + '</b><span class="muted">' + esc(f.workstream || '—') + (f.parentId ? ' · bagian dari ' + esc((finById(f.parentId) || {}).item || '') : '') +
      (cur && !mine ? ' · sekarang di task: ' + esc(cur.name) : '') + '</span></span><span class="num lf-amt">' + rp(calc(f).base) + '</span></label>';
  }).join('');
  openModal('<form id="lfForm" novalidate><div class="modal-h"><h3>Link Finance &amp; Procurement</h3><button type="button" class="btn ghost sm" data-act="modal-cancel" aria-label="Close">✕</button></div>' +
    '<div class="modal-b one"><p class="muted" style="margin:0">Centang item budget yang mau ditautkan ke task <b>' + esc(t.name) + '</b>. Item yang dicentang pindah ke task ini; yang dihapus centangnya kembali jadi task sendiri.</p>' +
    '<input class="input" id="lfSearch" type="search" placeholder="Cari item, kategori, task…">' +
    '<div class="lf-list" id="lfList">' + (rows || '<p class="faint">Belum ada item di Finance.</p>') + '</div></div>' +
    '<div class="modal-f"><div class="right"><button type="button" class="btn" data-act="modal-cancel">Cancel</button><button type="submit" class="btn primary">Simpan Link</button></div></div></form>', 'wide');
  var q = document.getElementById('lfSearch');
  q.addEventListener('input', function () { var v = q.value.trim().toLowerCase(); document.querySelectorAll('#lfList .lf-row').forEach(function (r) { r.hidden = !!v && r.dataset.q.indexOf(v) < 0; }); });
  document.getElementById('lfForm').onsubmit = function (e) {
    e.preventDefault();
    var n = 0, now = Date.now();
    document.querySelectorAll('#lfList input[type=checkbox]').forEach(function (c) {
      var f = finById(c.value); if (!f) return;
      if (c.checked && f.taskId !== t.id) { f.taskId = t.id; f.taskSynced = true; f.wsSynced = false; f.updatedAt = now; n++; }
      else if (!c.checked && f.taskId === t.id) { f.taskId = null; f.taskSynced = false; f.updatedAt = now; n++; }
    });
    closeModal(); ui.expanded = t.id; ui.tfOpen = ui.tfOpen || {}; ui.tfOpen[t.id] = true;
    commit(n ? n + ' item budget diperbarui' : 'Tidak ada perubahan');
  };
}
// a task can belong to several workstreams (t.workstreams); t.workstream (the first one) is kept for older data and other pages
function taskWorkstreams(t) {
  var list = Array.isArray(t.workstreams) ? t.workstreams.slice() : [];
  if (t.workstream && list.indexOf(t.workstream) < 0) list.unshift(t.workstream);
  return list.filter(function (w, i, a) { return w && a.indexOf(w) === i; });
}
function wsTags(t) {
  var list = taskWorkstreams(t);
  return list.length ? list.map(function (w) { return wsTag(w); }).join(' ') : wsTag('');
}
function allWorkstreams() {
  var set = (db.settings.workstreams || []).slice();
  db.tasks.concat(db.finance).forEach(function (r) {
    var list = Array.isArray(r.workstreams) ? r.workstreams.slice() : [];
    if (r.workstream && list.indexOf(r.workstream) < 0) list.push(r.workstream);
    list.forEach(function (w) { if (w && set.indexOf(w) < 0) set.push(w); });
  });
  return set;
}

var ui = loadUI();
function loadUI() {
  var d = { page: 'timeline', mtHide: [], rdLoc: '', rdQ: '', taskView: 'all', q: '', fWs: [], fStatus: [], fSrc: '', sort: { key: 'deadline', dir: 1 }, expanded: null,
    finQ: '', finWs: '', finPay: '', finInv: '', calMonth: '2026-10', colF: {} };
  try { var raw = localStorage.getItem(UI_KEY); if (raw) { var p = JSON.parse(raw); for (var k in p) d[k] = p[k]; } } catch (e) {}
  d.fWs = []; d.fStatus = [];   // toolbar filters removed: column-header filters replace them
  if (d.colF) Object.keys(d.colF).forEach(function (k) { if (!d.colF[k] || !Array.isArray(d.colF[k].v)) delete d.colF[k]; });
  d.msOpen = '';
  if (!d.colF || typeof d.colF !== 'object' || Array.isArray(d.colF)) d.colF = {};
  if (d.sortV !== 3) { d.sort = { key: 'deadline', dir: -1 }; d.sortV = 3; }   // everyone starts on deadline order, newest first
  var h = (location.hash || '').replace('#', '');
  if (['timeline','rundown','overview','present','tasks','finance','calendar','admin'].indexOf(h) > -1) d.page = h;
  return d;
}
function saveUI() { try { localStorage.setItem(UI_KEY, JSON.stringify(ui)); } catch (e) {} }

/* ================= Derived ================= */
function dueState(t) {
  if (!t.deadline) return { kind: 'none', days: null };
  var days = daysBetween(todayISO(), t.deadline);
  if (isDone(t)) return { kind: 'done', days: days };
  if (days < 0) return { kind: 'overdue', days: days };
  if (days <= 3) return { kind: 'soon', days: days };
  return { kind: 'ok', days: days };
}
function dueLabel(t) {
  var s = dueState(t);
  if (s.kind === 'none') return '<span class="faint">No Deadline</span>';
  var txt = fmtDate(t.deadline, true), sub = '';   // satu tanggal saja (start date hanya ada di form Edit task)
  if (s.kind === 'overdue') sub = ' · ' + (-s.days) + 'd overdue';
  else if (s.kind === 'soon') sub = s.days === 0 ? ' · today' : ' · in ' + s.days + 'd';
  return '<span class="due ' + s.kind + '">' + txt + sub + '</span>';
}
function kidsOf(f) { return f && f.id ? db.finance.filter(function (c) { return c.parentId === f.id; }) : []; }
function calc(f) {
  var qty = numOrNull(f.qty), unit = numOrNull(f.unitCost), estIn = numOrNull(f.estimated);
  var inv = numOrNull(f.invoice), dp = numOrNull(f.dp), fee = numOrNull(f.fee) || 0, paidAmt = numOrNull(f.paidAmount);
  var flags = [], parent = f.parentId ? finById(f.parentId) : null;
  var kids = (f.kind === 'vendor' || f.kind === 'allocation') ? kidsOf(f) : [];
  var est = estIn != null ? estIn : (qty != null && unit != null ? qty * unit : null);
  if (estIn == null && f.kind === 'vendor' && kids.length) est = kids.reduce(function (s, k) { return s + (calc(k).est || 0); }, 0);
  if (estIn != null && qty != null && unit != null && Math.abs(qty * unit - estIn) > 0.5) flags.push({ lvl: 'warn', msg: 'Qty × harga (' + rp(qty * unit) + ') ≠ total di sheet (' + rp(estIn) + ')' });
  if (parent && parent.kind === 'vendor') return { qty: qty, est: est, inv: null, dp: null, base: est, paid: 0, fee: 0, outstanding: null, flags: flags, inherited: true, parent: parent };
  if (f.kind === 'allocation') {
    var used = kids.reduce(function (s, k) { return s + (calc(k).base || 0); }, 0);
    if (est != null && used > est) flags.push({ lvl: 'crit', msg: 'Pemakaian (' + rp(used) + ') melebihi alokasi' });
    return { qty: qty, est: est, inv: null, dp: null, base: est, paid: 0, fee: 0, outstanding: null, used: used, fundLeft: est == null ? null : est - used, flags: flags, allocation: true };
  }
  var base = inv != null ? inv : est, paid = 0;
  if (paidAmt != null) paid = paidAmt;
  var pt = payType(f.paymentStatus);
  if (paidAmt == null && pt === 'paid') paid = base || 0;
  else if (paidAmt == null && pt === 'partial') paid = dp || 0;
  if (pt === 'paid' && inv == null) flags.push({ lvl: 'crit', msg: f.paymentStatus + ' tapi invoice amount kosong' });
  if (pt === 'partial' && dp == null && paidAmt == null) flags.push({ lvl: 'crit', msg: f.paymentStatus + ' tapi nominal DP kosong' });
  if (pt === 'unpaid' && paidAmt != null && paidAmt > 0) flags.push({ lvl: 'warn', msg: 'Ada nominal transfer tapi status ' + f.paymentStatus });
  if (dp != null && base != null && dp > base) flags.push({ lvl: 'crit', msg: 'DP (' + rp(dp) + ') lebih besar dari ' + (inv != null ? 'invoice' : 'estimasi') });
  if (base != null && paid > base) flags.push({ lvl: 'crit', msg: 'Transfer (' + rp(paid) + ') melebihi invoice ' + rp(base) });
  if (pt === 'paid' && base != null && paid < base) flags.push({ lvl: 'crit', msg: f.paymentStatus + ' tapi transfer kurang ' + rp(base - paid) });
  if (inv != null && est != null && inv > est * 1.1) flags.push({ lvl: 'warn', msg: 'Invoice ' + Math.round((inv / est - 1) * 100) + '% di atas estimasi' });
  if (pt !== 'unpaid' && !f.receipt) flags.push({ lvl: 'warn', msg: 'Bukti transfer belum dilampirkan' });
  if (pt !== 'unpaid' && f.invoiceStatus === 'Unsubmitted') flags.push({ lvl: 'warn', msg: 'Sudah dibayar tapi invoice masih Unsubmitted' });
  if (f.paymentDeadline && f.paymentDeadline < todayISO() && pt !== 'paid') flags.push({ lvl: 'crit', msg: 'Lewat payment deadline (' + fmtDate(f.paymentDeadline, true) + ')' });
  if (base == null) flags.push({ lvl: 'warn', msg: 'Nominal belum diisi' });
  var outstanding = base == null ? null : Math.max(base - paid, 0);
  return { qty: qty, est: est, inv: inv, dp: dp, base: base, paid: paid, fee: fee, outstanding: outstanding, flags: flags, basedOnEstimate: inv == null && est != null };
}
/* v15: Buffer Budget = confirmed savings, item by item.
   Original budget = the item's estimate (a vendor invoice uses its own estimate or the sum of its line items).
   Actual cost = invoice amount (or the amount transferred when there is no invoice and it is fully paid).
   Counted only when the cost is confirmed: invoice Submitted or payment fully paid, and the row is not marked "Needs Verification".
   No double counting: line items inside a vendor invoice are compared once at invoice level, fund allocations (Emergency Fund) and
   their usage rows are excluded, transfer fees are ignored, and every row is counted at most once. */
function bufferBudget() {
  var out = { items: [], overItems: [], pending: [], savings: 0, over: 0 };
  db.finance.forEach(function (f) {
    var c = calc(f), par = f.parentId ? finById(f.parentId) : null;
    if (c.inherited || c.allocation || (par && par.kind === 'allocation')) return;
    var est = c.est, paidAmt = numOrNull(f.paidAmount), isPaid = payType(f.paymentStatus) === 'paid';
    var actual = c.inv != null ? c.inv : (paidAmt != null && isPaid ? paidAmt : null);
    if (est == null || est <= 0 || actual == null) return;
    var submitted = f.invoiceStatus === 'Submitted';
    var confirmed = (isPaid || submitted) && f.source !== 'verify';
    var row = { f: f, est: est, actual: actual, diff: est - actual, basis: isPaid ? 'Paid' : submitted ? 'Invoice submitted' : f.source === 'verify' ? 'Needs verification' : 'Invoice not submitted' };
    if (!confirmed) { if (row.diff > 0) out.pending.push(row); return; }
    if (row.diff > 0) { out.items.push(row); out.savings += row.diff; }
    else if (row.diff < 0) { out.overItems.push(row); out.over += -row.diff; }
  });
  out.items.sort(function (a, b) { return b.diff - a.diff; });
  out.overItems.sort(function (a, b) { return a.diff - b.diff; });
  return out;
}
function bufferDialog() {
  var b = bufferBudget();
  function table(rows, kind) {
    if (!rows.length) return '<p class="faint" style="margin:0">' + (kind === 'save' ? 'No confirmed savings yet.' : 'None.') + '</p>';
    return '<div class="buf-wrap"><table class="buf-tbl"><thead><tr><th>Item</th><th class="r">Original Budget</th><th class="r">Actual Cost</th><th class="r">' + (kind === 'over' ? 'Over Budget' : 'Savings') + '</th></tr></thead><tbody>' +
      rows.map(function (r) {
        return '<tr data-act="edit-fin" data-id="' + r.f.id + '"><td><b>' + esc(r.f.item || '(no name)') + '</b><span class="muted">' + esc(r.f.workstream || '—') + ' · ' + esc(r.basis) + '</span></td>' +
          '<td class="num r" data-l="Original">' + rp(r.est) + '</td><td class="num r" data-l="Actual">' + rp(r.actual) + '</td><td class="num r ' + (r.diff >= 0 ? 'buf-pos' : 'buf-neg') + '" data-l="' + (kind === 'over' ? 'Over' : 'Savings') + '">' + rp(Math.abs(r.diff)) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }
  openModal('<div class="modal-h"><h3>Buffer Budget</h3><button type="button" class="btn ghost sm" data-act="modal-cancel" aria-label="Close">✕</button></div>' +
    '<div class="modal-b one">' +
    '<div class="buf-sum"><div><span>Confirmed Savings</span><b class="buf-pos">' + rp(b.savings) + '</b></div><div><span>Over Budget (confirmed)</span><b class="buf-neg">' + rp(b.over) + '</b></div><div><span>Net Buffer</span><b>' + rp(b.savings - b.over) + '</b></div></div>' +
    '<p class="muted" style="margin:0;font-size:12.5px">Savings = original budget − actual cost, per item. Only confirmed costs count (invoice submitted or fully paid, and not marked Needs Verification). Line items inside a vendor invoice are compared once at invoice level; Emergency Fund allocations and transfer fees are excluded. Click a row to open the item.</p>' +
    '<h4 class="buf-h">Savings · ' + b.items.length + ' item' + (b.items.length === 1 ? '' : 's') + '</h4>' + table(b.items, 'save') +
    (b.overItems.length ? '<h4 class="buf-h">Over Budget · ' + b.overItems.length + ' item' + (b.overItems.length === 1 ? '' : 's') + '</h4>' + table(b.overItems, 'over') : '') +
    (b.pending.length ? '<details class="buf-pending"><summary>Potential savings not counted yet · ' + b.pending.length + ' item' + (b.pending.length === 1 ? '' : 's') + ' (' + rp(b.pending.reduce(function (s, r) { return s + r.diff; }, 0)) + ')</summary>' + table(b.pending, 'save') + '</details>' : '') +
    '</div><div class="modal-f"><div class="right"><button type="button" class="btn" data-act="modal-cancel">Close</button></div></div>', 'wide', { allowReadonly: true });
}
function totals(list) {
  var inList = {}; list.forEach(function (f) { inList[f.id] = 1; });
  var t = { est: 0, inv: 0, paid: 0, fee: 0, outstanding: 0, missing: 0, flagged: 0, count: list.length };
  list.forEach(function (f) {
    var c = calc(f), p = f.parentId ? finById(f.parentId) : null;
    // budget: count each figure once — vendor parents carry their line items; allocation children sit inside the allocation
    if (!p || (p.kind === 'vendor' && !inList[p.id])) t.est += c.est || 0;
    if (!c.inherited) { t.inv += c.inv || 0; t.paid += c.paid; t.fee += c.fee || 0; t.outstanding += c.outstanding || 0; if (c.base == null) t.missing++; }
    if (c.flags.length || f.source === 'verify') t.flagged++;
  });
  return t;
}
function taskStats() {
  var s = { total: db.tasks.length, done: 0, prog: 0, appr: 0, blocked: 0, overdue: 0, notUpdated: 0 };
  db.tasks.forEach(function (t) {
    var ty = sType(t.status);
    if (ty === 'done') s.done++; else if (ty === 'progress') s.prog++; else if (ty === 'pending') s.appr++; else if (ty === 'blocked') s.blocked++;
    if (dueState(t).kind === 'overdue') s.overdue++;
  });
  return s;
}

/* ================= Rendering ================= */
var main = document.getElementById('main');
function render() {
  db = normalizeDb(db);
  var focusId = document.activeElement && document.activeElement.id, selStart = null;
  try { selStart = document.activeElement.selectionStart; } catch (e) {}
  applySettings();
  document.body.classList.toggle('readonly', !canEdit());
  document.body.classList.toggle('mode-admin', MODE === 'admin');
  applySidebar();
  document.querySelectorAll('#nav button').forEach(function (b) { b.setAttribute('aria-current', b.dataset.page === ui.page ? 'page' : 'false'); });
  var st = taskStats();
  document.getElementById('navTaskCount').textContent = st.total;
  document.getElementById('navOverdue').textContent = st.overdue ? st.overdue + ' overdue' : '';
  var dl = daysBetween(todayISO(), EVENT_DATE);
  document.getElementById('countdown').innerHTML = dl >= 0
    ? '<div class="d">' + dl + '</div><div class="l">' + (dl === 1 ? 'day' : 'days') + ' to Event Day · ' + fmtDate(EVENT_DATE, true) + '</div>'
    : '<div class="d">Done</div><div class="l">Event Day was ' + fmtDate(EVENT_DATE) + '</div>';
  document.getElementById('storeNote').textContent = storageOK ? 'Saved in this browser · last save ' + new Date(db.savedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'Storage unavailable';
  var banner = storageError ? '<div class="banner' + (storageOK ? ' warn' : '') + '" role="alert">' + esc(storageError) + '</div>' : '';
  var html = '', Admin = MODE === 'admin' ? window.GX27Admin : null;
  var gate = Admin ? Admin.gate() : '';
  if (gate) { main.innerHTML = gate; saveUI(); if (Admin.afterRender) Admin.afterRender(); return; }
  if (ui.page === 'admin' && (!Admin || (Admin.isGuest && Admin.isGuest()))) ui.page = 'timeline';
  try {
    if (ui.page === 'admin') html = Admin.renderPage();
    else if (ui.page === 'timeline') html = renderMaster();
    else if (ui.page === 'rundown') html = renderRundown();
    else if (ui.page === 'overview') html = renderOverview();
    else if (ui.page === 'present') html = renderPresent();
    else if (ui.page === 'tasks') html = renderTasks();
    else if (ui.page === 'finance') html = renderFinance();
    else html = renderCalendar();
  } catch (e) {
    console.error(e);
    html = '<div class="banner" role="alert">Something went wrong drawing this page (' + esc(e.message) + '). Your data is still saved. Try another page or refresh.</div>';
  }
  var winY = window.scrollY, winX = window.scrollX;
  var boxes = [].map.call(main.querySelectorAll('.table-wrap'), function (el) { return [el.scrollTop, el.scrollLeft]; });
  main.innerHTML = (Admin ? Admin.barHtml() : '') + banner + html;
  main.querySelectorAll('.table-wrap').forEach(function (el, i) { if (boxes[i]) { el.scrollTop = boxes[i][0]; el.scrollLeft = boxes[i][1]; } });
  if (window.scrollY !== winY || window.scrollX !== winX) window.scrollTo(winX, winY);
  if (!canEdit()) main.querySelectorAll('[data-inline]').forEach(function (el) { el.disabled = true; });
  saveUI();
  try { rzApply(main); } catch (e) { console.error(e); }
  if (Admin && Admin.afterRender) Admin.afterRender();
  if (focusId) { var el = document.getElementById(focusId); if (el) { el.focus({ preventScroll: true }); try { if (selStart != null) el.setSelectionRange(selStart, selStart); } catch (e) {} } }
}

/* ---------- v16: collapsible sidebar (☰ top-left). Remembered per browser in ui.sideHidden. ---------- */
function applySidebar() {
  var hidden = !!ui.sideHidden || document.body.classList.contains('present-fs');
  document.body.classList.toggle('side-hidden', hidden);
  var b = document.getElementById('sideToggle');
  if (b) { b.setAttribute('aria-expanded', String(!hidden)); b.setAttribute('aria-label', hidden ? 'Show sidebar' : 'Hide sidebar'); b.title = hidden ? 'Show sidebar' : 'Hide sidebar'; }
}
(function () {
  var b = document.getElementById('sideToggle');
  if (b) b.addEventListener('click', function () { ui.sideHidden = !ui.sideHidden; saveUI(); applySidebar(); });
})();

/* ---------- v16: Presentation dashboard — live summary of Tasks & Finance for meetings ---------- */
function relTime(ms) {
  if (!ms) return '';
  var m = Math.round((Date.now() - ms) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return m + ' min ago';
  var h = Math.round(m / 60); if (h < 24) return h + ' h ago';
  var d = Math.round(h / 24); if (d < 31) return d + ' d ago';
  return new Date(ms).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}
function pDonut(parts, total, center, sub) {
  var r = 52, C = 2 * Math.PI * r, off = 0;
  var segs = parts.filter(function (x) { return x.n > 0; }).map(function (x) {
    var len = total ? x.n / total * C : 0, seg = '<circle r="' + r + '" cx="64" cy="64" fill="none" stroke="' + x.c + '" stroke-width="16" stroke-dasharray="' + len.toFixed(2) + ' ' + (C - len).toFixed(2) + '" stroke-dashoffset="' + (-off).toFixed(2) + '" transform="rotate(-90 64 64)"><title>' + esc(x.k) + ': ' + x.n + '</title></circle>';
    off += len; return seg;
  }).join('');
  return '<svg class="pd-donut" viewBox="0 0 128 128" role="img" aria-label="' + esc(center + ' ' + sub) + '"><circle r="' + r + '" cx="64" cy="64" fill="none" stroke="var(--neutral-bg)" stroke-width="16"/>' + segs +
    '<text x="64" y="62" text-anchor="middle" class="pd-donut-v">' + esc(center) + '</text><text x="64" y="80" text-anchor="middle" class="pd-donut-s">' + esc(sub) + '</text></svg>';
}
function renderPresent() {
  var today = todayISO(), st = taskStats(), ft = totals(db.finance), buf = bufferBudget();
  var notStarted = Math.max(0, st.total - st.done - st.prog - st.appr - st.blocked);
  var pct = st.total ? Math.round(st.done / st.total * 100) : 0;
  var parts = [
    { k: 'Completed', n: st.done, c: 'var(--ok)' }, { k: 'In Progress', n: st.prog, c: 'var(--info)' },
    { k: 'Pending', n: st.appr, c: 'var(--warn)' }, { k: 'Blocked', n: st.blocked, c: 'var(--crit)' }, { k: 'Not Started', n: notStarted, c: 'var(--faint)' }
  ];
  var dl = daysBetween(today, EVENT_DATE), now = new Date();
  var h = '<div class="pd">';
  h += '<div class="pd-head"><div><div class="pd-eyebrow">' + esc(db.settings.eventName || 'Event') + ' · Status Update</div><h1>Project Dashboard</h1>' +
    '<p>Live data as of ' + fmtDate(today) + ', ' + now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' · Event Day ' + fmtDate(EVENT_DATE) + '</p></div>' +
    '<div class="pd-head-r"><div class="pd-count"><b>' + (dl >= 0 ? dl : 0) + '</b><span>' + (dl === 1 ? 'day' : 'days') + ' to Event Day</span></div>' +
    '<button class="btn" data-act="present-fs" type="button">' + (document.fullscreenElement ? 'Exit Full Screen' : 'Full Screen') + '</button></div></div>';

  // tasks + budget
  var stat = function (k, n, c, sub, act, arg) { return '<button type="button" class="pd-stat" data-act="' + act + '" data-view="' + arg + '" style="--c:' + c + '"><span class="k">' + k + '</span><b>' + n + '</b>' + (sub ? '<span class="s">' + sub + '</span>' : '') + '</button>'; };
  h += '<div class="pd-row pd-row-2">';
  h += '<section class="pd-card"><div class="pd-card-h"><h2>Task Progress</h2><span class="muted">' + st.total + ' tasks</span></div><div class="pd-tasks">' +
    pDonut(parts, st.total, pct + '%', 'completed') +
    '<div class="pd-legend">' + parts.map(function (x) { return '<div><i style="background:' + x.c + '"></i><span>' + x.k + '</span><b class="num">' + x.n + '</b></div>'; }).join('') + '</div></div>' +
    '<div class="pd-stats">' + stat('Completed', st.done, 'var(--ok)', '', 'go-tasks', 'all') + stat('In Progress', st.prog, 'var(--info)', '', 'go-tasks', 'all') +
    stat('Pending', st.appr, 'var(--warn)', '', 'go-tasks', 'pending') + stat('Overdue', st.overdue, 'var(--crit)', 'past deadline, not done', 'go-tasks', 'pending') + '</div></section>';
  var paidPct = ft.est ? Math.min(100, ft.paid / ft.est * 100) : 0, outPct = ft.est ? Math.min(100 - paidPct, ft.outstanding / ft.est * 100) : 0;
  h += '<section class="pd-card"><div class="pd-card-h"><h2>Budget Summary</h2><span class="muted">' + ft.count + ' budget items</span></div>' +
    '<div class="pd-money">' +
    '<div><span>Total Budget</span><b>' + rpShort(ft.est) + '</b><em>' + rp(ft.est) + '</em></div>' +
    '<div style="--c:var(--ok)"><span>Paid</span><b>' + rpShort(ft.paid) + '</b><em>' + Math.round(paidPct) + '% of budget</em></div>' +
    '<div style="--c:var(--warn)"><span>Outstanding Payment</span><b>' + rpShort(ft.outstanding) + '</b><em>' + rp(ft.outstanding) + '</em></div>' +
    '<button type="button" data-act="buffer-detail" style="--c:var(--info)"><span>Buffer Budget</span><b>' + rpShort(buf.savings) + '</b><em>' + buf.items.length + ' confirmed saving' + (buf.items.length === 1 ? '' : 's') + (buf.over ? ' · net ' + rpShort(buf.savings - buf.over) : '') + '</em></button></div>' +
    '<div class="pd-budgetbar" role="img" aria-label="Paid ' + Math.round(paidPct) + '%, outstanding ' + Math.round(outPct) + '%"><i class="paid" style="width:' + paidPct.toFixed(1) + '%"></i><i class="out" style="width:' + outPct.toFixed(1) + '%"></i></div>' +
    '<div class="pd-budgetkey"><span><i class="paid"></i>Paid</span><span><i class="out"></i>Outstanding</span><span><i class="rest"></i>Not yet invoiced / no amount</span></div></section>';
  h += '</div>';

  // overdue + upcoming (tasks and payments) + recent updates
  var items = [];
  db.tasks.forEach(function (t) { if (t.deadline && !isDone(t)) items.push({ kind: 'Task', date: t.deadline, title: t.name, ws: t.workstream, act: 'open-task', id: t.id, status: t.status }); });
  db.finance.forEach(function (f) {
    var c = calc(f); if (c.inherited || c.allocation || !f.paymentDeadline || payType(f.paymentStatus) === 'paid') return;
    items.push({ kind: 'Payment', date: f.paymentDeadline, title: f.item, ws: f.workstream, act: 'edit-fin', id: f.id, status: f.paymentStatus, amt: c.outstanding });
  });
  var overdue = items.filter(function (x) { return x.date < today; }).sort(function (a, b) { return a.date < b.date ? -1 : 1; });
  var upcoming = items.filter(function (x) { var d = daysBetween(today, x.date); return d >= 0 && d <= 14; }).sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
  var LIM = 7;
  function itemRow(x, mode) {
    var d = daysBetween(today, x.date), c = wsColor(x.ws);
    var when = mode === 'over' ? (-d) + 'd overdue' : d === 0 ? 'today' : d === 1 ? 'tomorrow' : 'in ' + d + 'd';
    return '<div class="pd-item" data-act="' + x.act + '" data-id="' + x.id + '" role="button" tabindex="0"><span class="pd-date' + (mode === 'over' ? ' over' : d <= 3 ? ' soon' : '') + '"><b>' + fmtDate(x.date, true) + '</b><em>' + when + '</em></span>' +
      '<span class="pd-it"><b>' + esc(x.title || '(no name)') + '</b><span><i style="background:' + c[0] + '"></i>' + esc(x.ws || '—') + ' · <span class="pd-kind">' + x.kind + '</span>' + (x.amt ? ' · ' + rp(x.amt) : '') + '</span></span></div>';
  }
  function list(title, arr, mode, empty, act, view) {
    return '<section class="pd-card pd-list"><div class="pd-card-h"><h2>' + title + ' <span class="pd-pill' + (mode === 'over' && arr.length ? ' crit' : '') + '">' + arr.length + '</span></h2></div>' +
      (arr.length ? arr.slice(0, LIM).map(function (x) { return itemRow(x, mode); }).join('') : '<div class="pd-empty">' + empty + '</div>') +
      (arr.length > LIM ? '<button type="button" class="pd-more" data-act="' + act + '" data-view="' + view + '">+ ' + (arr.length - LIM) + ' more</button>' : '') + '</section>';
  }
  var recent = db.tasks.map(function (t) { return { kind: 'Task', at: t.updatedAt || t.createdAt || 0, title: t.name, ws: t.workstream, act: 'open-task', id: t.id, status: t.status }; })
    .concat(db.finance.map(function (f) { return { kind: 'Budget', at: f.updatedAt || f.createdAt || 0, title: f.item, ws: f.workstream, act: 'edit-fin', id: f.id, status: f.paymentStatus }; }))
    .filter(function (x) { return x.at; }).sort(function (a, b) { return b.at - a.at; }).slice(0, LIM);
  h += '<div class="pd-row pd-row-3">' +
    list('Overdue', overdue, 'over', 'Nothing overdue.', 'go-tasks', 'pending') +
    list('Upcoming · Next 14 Days', upcoming, 'up', 'No deadlines in the next 14 days.', 'go-tasks', 'timeline') +
    '<section class="pd-card pd-list"><div class="pd-card-h"><h2>Recent Updates</h2></div>' + (recent.length ? recent.map(function (x) {
      var c = wsColor(x.ws);
      return '<div class="pd-item" data-act="' + x.act + '" data-id="' + x.id + '" role="button" tabindex="0"><span class="pd-date"><b>' + relTime(x.at) + '</b><em>' + x.kind + '</em></span>' +
        '<span class="pd-it"><b>' + esc(x.title || '(no name)') + '</b><span><i style="background:' + c[0] + '"></i>' + esc(x.ws || '—') + (x.status ? ' · ' + esc(x.status) : '') + '</span></span></div>';
    }).join('') : '<div class="pd-empty">No updates yet.</div>') + '</section></div>';

  // progress by workstream
  var ws = allWorkstreams().map(function (w) {
    var ts = db.tasks.filter(function (t) { return taskWorkstreams(t).indexOf(w) > -1; });
    if (!ts.length) return null;
    var d = ts.filter(isDone).length, od = ts.filter(function (t) { return dueState(t).kind === 'overdue'; }).length;
    return { w: w, n: ts.length, d: d, od: od, p: Math.round(d / ts.length * 100) };
  }).filter(Boolean);
  h += '<section class="pd-card"><div class="pd-card-h"><h2>Progress by Workstream</h2><span class="muted">tasks done / total</span></div><div class="pd-ws">' + ws.map(function (x) {
    var c = wsColor(x.w);
    return '<div class="pd-ws-r"><span class="pd-ws-n"><i style="background:' + c[0] + '"></i>' + esc(x.w) + '</span><span class="pd-ws-bar"><i style="width:' + x.p + '%;background:' + c[0] + '"></i></span>' +
      '<span class="pd-ws-c num">' + x.d + '/' + x.n + (x.od ? ' <em>' + x.od + ' overdue</em>' : '') + '</span></div>';
  }).join('') + '</div></section>';
  return h + '</div>';
}
document.addEventListener('fullscreenchange', function () {
  if (!document.fullscreenElement) document.body.classList.remove('present-fs');
  if (ui.page === 'present') render(); else applySidebar();
});

function pageHead(title, sub, actions) {
  return '<div class="page-head"><div><h1>' + title + '</h1>' + (sub ? '<p>' + sub + '</p>' : '') + '</div>' + (actions ? '<div class="toolbar" style="margin:0">' + actions + '</div>' : '') + '</div>';
}


/* ---------- Master Timeline ---------- */
var PROGRAMS = ['GX Connect','GX Got Talent','Mobile Legends','HYROX'];
// which tasks are on the Master Timeline: Event Day segments, every "Program Milestone" (any workstream), program tasks that are not procurement,
// plus any task switched on/off by hand with "Tampilkan di Master Timeline" (t.mt)
function isProgram(ws) { return PROGRAMS.indexOf(wsBase(ws)) > -1; }
function mtDefault(t) { return t.category === 'Event Day' || t.category === 'Program Milestone' || (isProgram(t.workstream) && t.category !== 'Procurement'); }
function onMaster(t) { return typeof t.mt === 'boolean' ? t.mt : mtDefault(t); }
function mtWorkstreams(list) {
  // legend follows the names and order set in Manage Categories (Workstream); the 4 programs are always listed
  var have = {}; list.forEach(function (t) { if (t.workstream) have[t.workstream] = 1; });
  var order = allWorkstreams().filter(function (w) { return wsBase(w) !== 'Event Day'; });
  PROGRAMS.forEach(function (p) { var cur = wsCurrent(p); if (order.indexOf(cur) < 0 && have[cur]) order.push(cur); });
  Object.keys(have).forEach(function (w) { if (order.indexOf(w) < 0 && wsBase(w) !== 'Event Day') order.push(w); });
  return order.filter(function (w) { return have[w] || (isProgram(w) && db.settings.workstreams.indexOf(w) > -1); });
}
function mtStyle(ws, kind) {
  if (wsClass(ws)) return '';
  var c = wsColor(ws);
  if (kind === 'pill') return ' style="background:' + c[1] + ';color:' + c[0] + ';border-color:' + c[0] + '55"';
  if (kind === 'dot') return ' style="background:' + c[0] + '"';
  return ' style="color:' + c[0] + '"';
}
function renderMaster() {
  var hide = ui.mtHide || [];
  var all = db.tasks.filter(function (t) { return t.deadline && onMaster(t); });
  var eventItems = all.filter(function (t) { return t.category === 'Event Day'; });
  var wsShown = mtWorkstreams(all.filter(function (t) { return t.category !== 'Event Day'; }));
  var pre = all.filter(function (t) { return t.category !== 'Event Day' && hide.indexOf(t.workstream) < 0; });
  var doneN = all.filter(isDone).length;
  var nextT = all.filter(function (t) { return !isDone(t) && t.deadline >= todayISO(); }).sort(function (a, b) { return a.deadline < b.deadline ? -1 : 1; })[0];
  var h = '<div class="mt-head"><div><div class="mt-eyebrow">— Road to GX 27</div><h1 class="mt-title">MASTER <span>TIMELINE</span></h1><p>' + esc(db.settings.timelineSubtitle || '') + '</p></div>' +
    '<div class="mt-actions"><button class="btn primary" data-act="new-milestone">+ Add Milestone</button><div class="mt-legend" role="group" aria-label="Show workstreams">' +
    wsShown.map(function (p) { return '<button class="mt-pill ' + wsClass(p) + '"' + mtStyle(p, 'pill') + ' data-act="mt-toggle" data-ws="' + esc(p) + '" aria-pressed="' + (hide.indexOf(p) < 0) + '">' + esc(p) + '</button>'; }).join('') +
    (wsShown.length > 4 ? '<button class="mt-pill mt-all" data-act="mt-all" aria-label="Tampilkan semua workstream">' + (hide.length ? 'Show All' : 'Hide All') + '</button>' : '') + '</div></div></div>';
  h += '<div class="mt-progress"><span><b>' + doneN + '/' + all.length + '</b> Milestones Done</span>' + (nextT ? '<span>Next: <b>' + fmtDate(nextT.deadline, true).toUpperCase() + '</b> ' + esc(nextT.workstream) + ' · ' + esc(nextT.name) + '</span>' : '') + '<span>' + (canEdit() ? 'Klik item untuk edit' : 'Klik item untuk detail') + '</span></div>';
  // group by month (of start date) then by date label
  var months = {};
  pre.forEach(function (t) { var key = (t.start || t.deadline).slice(0, 7); (months[key] = months[key] || []).push(t); });
  var monthKeys = Object.keys(months).sort();
  if (!monthKeys.length && !eventItems.length) return h + '<div class="table-wrap">' + emptyBox('No Milestones to Show', 'Turn a program back on above, or add a milestone.') + '</div>';
  var cards = monthKeys.map(function (m) {
    var groups = {}, order = [];
    months[m].sort(function (a, b) { var x = a.start || a.deadline, y = b.start || b.deadline; return x < y ? -1 : x > y ? 1 : (a.deadline < b.deadline ? -1 : 1); })
      .forEach(function (t) { var lab = fmtRange(t).toUpperCase(); if (!groups[lab]) { groups[lab] = []; order.push(lab); } groups[lab].push(t); });
    var d = parseISO(m + '-01');
    var rows = order.map(function (lab) {
      var g = groups[lab], dotCls = 'dot-' + wsClass(g[0].workstream);
      return '<div class="mt-row"><div class="mt-date"><i class="' + dotCls + '"' + mtStyle(g[0].workstream, 'dot') + '></i>' + lab + '</div><div class="mt-items">' + g.map(function (t) {
        var st = dueState(t), stColor = st.kind === 'overdue' ? 'var(--crit)' : (statusDef(t.status).color === 'neutral' ? 'transparent' : COLOR_VAR[statusDef(t.status).color] || 'transparent');
        return '<button class="mt-item' + (isDone(t) ? ' done' : '') + '" data-act="edit-task" data-id="' + t.id + '" title="' + esc(t.status + (st.kind === 'overdue' ? ' · overdue' : '')) + '"><span class="prog ' + wsClass(t.workstream) + '"' + mtStyle(t.workstream, 'prog') + '>' + esc(t.workstream) + '</span><span class="txt">' + esc(t.name) + (t.notes ? ' · ' + esc(t.notes.split('\n')[0]) : '') + '<span class="mt-st">' + statusBadge(t.status) + '</span></span></button>';
      }).join('') + '</div></div>';
    }).join('');
    return '<div class="mt-card"><div class="mt-card-h"><b>' + MONTHS_FULL[d.getMonth()] + ' ' + d.getFullYear() + '</b><span>' + order.length + ' MILESTONES</span></div><div class="mt-rows">' + rows + '</div></div>';
  });
  var ev = '';
  if (eventItems.length) {
    var ed = eventItems[0].deadline;
    ev = '<div class="mt-event"><div><div class="d">' + fmtDate(ed, true).toUpperCase().replace(/^0/, '') + '</div><div class="l">EVENT DAY</div></div><div><h3>' + esc((db.settings.eventName || '').toUpperCase()) + '</h3><div class="mt-chips">' +
      eventItems.map(function (t, i) { return '<button style="--sc:' + (COLOR_VAR[statusDef(t.status).color] || 'var(--faint)') + '" class="mt-chip' + (/ceremony/i.test(t.name) ? ' hl' : '') + (isDone(t) ? ' done' : '') + '" data-act="edit-task" data-id="' + t.id + '" title="' + esc(t.status) + '">' + esc(t.name) + '</button>'; }).join('') +
      '<button class="mt-chip" data-act="new-event-item" aria-label="Add event day segment">+</button></div></div></div>';
  }
  var left = cards[0] || '', right = cards.slice(1).join('') + ev;
  if (!cards.length) left = ev, right = '';
  h += '<div class="mt-grid"><div class="mt-col">' + left + '</div><div class="mt-col">' + right + '</div></div>';
  h += '<div class="mt-foot"><img src="' + esc(logoSrc()) + '" alt="Logo"><span>' + esc(db.settings.timelineTagline || '') + '</span></div>';
  return h;
}


/* ---------- Rundown ---------- */
function rdMinutes(t) { var m = /^(\d{1,2}):(\d{2})/.exec(t || ''); return m ? (+m[1]) * 60 + (+m[2]) : null; }
function rdItems(group) {
  return db.rundown.filter(function (r) { return (r.group || 'flow') === group; }).sort(function (a, b) { return (rdMinutes(a.start) || 0) - (rdMinutes(b.start) || 0) || (rdMinutes(b.end) || 0) - (rdMinutes(a.end) || 0) || (a.order || 0) - (b.order || 0); });
}
function rdLocations(group) { var out = []; rdItems(group).forEach(function (r) { if (r.location && out.indexOf(r.location) < 0) out.push(r.location); }); return out; }
function rdFilter(list) {
  var q = (ui.rdQ || '').trim().toLowerCase();
  return list.filter(function (r) {
    if (ui.rdLoc && r.location !== ui.rdLoc) return false;
    if (q && [r.segment, r.location, r.flow, r.mcCue, r.av, r.ops, r.docs, r.pic, (r.concurrent || []).join(' ')].join(' ').toLowerCase().indexOf(q) < 0) return false;
    return true;
  });
}
function rdNow() { return todayISO() === EVENT_DATE ? new Date().getHours() * 60 + new Date().getMinutes() : null; }
function rdLive(r, now) { var s = rdMinutes(r.start), e = rdMinutes(r.end); return now != null && s != null && e != null && now >= s && now < e; }
function renderRundown() {
  var fm = db.flowMeta || {};
  var h = '<div class="mt-head"><div><div class="mt-eyebrow">— Festival run of show</div><h1 class="mt-title">GX 27 <span class="rd-accent">FESTIVAL FLOW</span></h1><p>' + esc(fm.subtitle || 'Main program dan aktivitas paralel dalam satu alur festival.') + ' · ' + fmtDate(EVENT_DATE) + '</p></div>' +
    '<div class="rd-gate"><span><i></i>Open gate ' + esc(fm.openGate || '09:00') + '</span><span class="rd-gate-line"></span><span>Close ' + esc(fm.close || '20:00') + '</span></div></div>';
  h += '<div class="toolbar"><input class="input search" id="rdSearch" type="search" placeholder="Cari segmen, lokasi, catatan…" value="' + esc(ui.rdQ || '') + '" aria-label="Cari rundown">' +
    '<select class="select" id="rdLoc" aria-label="Lokasi">' + opts(rdLocations('flow'), ui.rdLoc || '', 'Semua Lokasi') + '</select>' +
    ((ui.rdQ || ui.rdLoc) ? '<button class="btn ghost sm" data-act="rd-clear">Clear Filters</button>' : '') +
    '<span style="margin-left:auto;display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-act="new-zone">+ Zona / Area</button><button class="btn primary" data-act="new-rundown">+ Segmen</button></span></div>';
  return h + renderFlow();
}
function zoneCard(z, i) {
  var cls = ['connect', 'ggt', 'ml', 'hyrox', 'event', ''][i % 6];
  return '<button class="zone-card ' + (z.kind === 'area' ? 'area ' : '') + 'z-' + (i % 6) + '" data-act="edit-zone" data-id="' + z.id + '">' +
    '<span class="zone-top">' + (z.kind === 'area' ? '<span class="zone-no">' + String(i + 1).padStart(2, '0') + '</span>' : '<b>' + esc(z.name) + '</b>') +
    '<span class="zone-tag">' + esc(z.kind === 'area' ? z.location : z.time) + '</span></span>' +
    (z.kind === 'area' ? '<b class="zone-name">' + esc(z.name) + '</b>' : '<span class="zone-bar"></span>') +
    '<span class="zone-detail">' + esc(z.detail || '') + '</span></button>';
}
function renderFlow() {
  var zones = (db.zones || []).slice().sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
  var acts = zones.filter(function (z) { return z.kind !== 'area'; }), areas = zones.filter(function (z) { return z.kind === 'area'; });
  var h = '';
  if (acts.length) h += '<div class="zone-grid">' + acts.map(zoneCard).join('') + '</div>';
  if (areas.length) h += '<div class="area-intro"><div class="area-head"><div><span class="mt-eyebrow" style="color:var(--accent)">Explore the Festival</span><h2>Area Introduction</h2></div><div class="area-path">' + areas.map(function (z) { return '<span>' + esc(z.location) + '</span>'; }).join('<i>→</i>') + '</div></div><div class="area-grid">' + areas.map(zoneCard).join('') + '</div></div>';
  var list = rdFilter(rdItems('flow')), now = rdNow();
  if (!rdItems('flow').length) return h + '<div class="table-wrap">' + emptyBox('Festival Flow Masih Kosong', 'Tambah segmen pertama dengan tombol + Segmen.') + '</div>';
  if (!list.length) return h + '<div class="table-wrap">' + emptyBox('Tidak Ada Segmen yang Cocok', 'Coba kata kunci lain atau hapus filter.') + '</div>';
  // group items that share the same start + end into one "parallel" block
  var blocks = [], key = {};
  list.forEach(function (r) { var k = r.start + '|' + r.end; if (key[k]) key[k].items.push(r); else { key[k] = { start: r.start, end: r.end, items: [r] }; blocks.push(key[k]); } });
  var parts = [];
  blocks.forEach(function (b) {
    var h = '';
    if (b.items.length > 1) {
      var mins = rdMinutes(b.end) - rdMinutes(b.start);
      h += '<div class="flow-par' + (b.items.some(function (r) { return rdLive(r, now); }) ? ' live' : '') + '"><div class="flow-par-h"><div><b class="flow-par-time">' + esc(b.start) + ' → ' + esc(b.end) + '</b><h3>' + b.items.length + ' program berjalan bersamaan</h3></div>' +
        (mins > 0 ? '<span class="badge b-accent nodot">' + (mins % 60 ? mins + ' menit' : (mins / 60) + (mins === 60 ? ' hour' : ' hours')) + '</span>' : '') + '</div><div class="flow-par-grid">' +
        b.items.map(function (r, i) {
          return '<button class="flow-par-item p-' + (i % 4) + '" data-act="rd-open" data-id="' + r.id + '"><span class="fp-loc">' + esc(r.location) + ' · ' + esc(r.start) + '–' + esc(r.end) + '</span><b>' + esc(r.segment) + '</b><span class="fp-bar"></span><span class="fp-desc">' + esc(r.flow || '') + '</span>' + rdBadges(r) + '</button>';
        }).join('') + '</div></div>';
      parts.push({ html: h, par: true }); return;
    }
    var r = b.items[0], live = rdLive(r, now), others = list.filter(function (x) { return x !== r && x.start === r.start; }).length;
    h += '<button class="flow-item' + (live ? ' live' : '') + (isDone(r) ? ' done' : '') + '" data-act="rd-open" data-id="' + r.id + '">' +
      '<span class="flow-time"><b>' + esc(r.start) + '</b><span>→ ' + esc(r.end) + '</span></span>' +
      '<span class="flow-card"><span class="flow-title"><b>' + esc(r.segment) + '</b>' + (r.location ? '<span class="flow-loc">' + esc(r.location) + '</span>' : '') + (others ? '<span class="badge b-info nodot">Paralel</span>' : '') + (live ? '<span class="badge b-accent nodot">Sedang Berjalan</span>' : '') + rdBadges(r) + '</span>' +
      (r.flow ? '<span class="flow-desc">' + esc(r.flow) + '</span>' : '') +
      ((r.concurrent || []).length ? '<span class="flow-conc"><span class="fc-label">Concurrent</span>' + r.concurrent.map(function (c) { return '<span class="fc-chip">' + esc(c) + '</span>'; }).join('') + '</span>' : '') +
      '</span></button>';
    parts.push({ html: h, par: false });
  });
  // two columns like the Figma page: before the first parallel block, then from it to the finale
  var cut = parts.findIndex(function (x) { return x.par; });
  if (cut <= 0 || ui.rdQ || ui.rdLoc) cut = Math.ceil(parts.length / 2);
  var col = function (arr, label) { return arr.length ? '<div class="flow-col"><div class="flow-col-h">' + label + '</div>' + arr.map(function (x) { return x.html; }).join('') + '</div>' : ''; };
  h += '<div class="flow-list">' + col(parts.slice(0, cut), 'Morning → afternoon') + col(parts.slice(cut), 'Peak program → finale');
  return h + '</div>';
}
function rdBadges(r) {
  return (r.pic ? '<span class="fp-pic">PIC: ' + esc(r.pic) + '</span>' : '') +
    statusBadge(r.status || defaultStatus()) +
    (r.source === 'verify' ? '<span class="src verify">Verify</span>' : '');
}
function rdDetail(r) {
  var cols = [['Deskripsi', r.flow], ['Catatan', r.ops]];
  if ((r.concurrent || []).length) cols.splice(1, 0, ['Concurrent', r.concurrent.join('\n')]);
  return (r.verifyNote ? '<p class="flag" style="white-space:normal;margin:0 0 10px">⚠ ' + esc(r.verifyNote) + '</p>' : '') +
    '<div class="rd-grid">' + cols.filter(function (c) { return c[1]; }).map(function (c) { return '<div><h4>' + c[0] + '</h4><p>' + (c[1] ? esc(c[1]) : '<span class="faint">—</span>') + '</p></div>'; }).join('') + '</div>' +
    (canEdit() ? '<div class="rd-actions"><button class="btn sm primary" data-act="edit-rundown" data-id="' + r.id + '">Edit Segmen</button><button class="btn sm danger" data-act="delete-rundown" data-id="' + r.id + '">Hapus</button>' + '</div>' : '');
}
function rdOpenDialog(id) {
  var r = rdById(id); if (!r) return;
  if (canEdit()) { rundownForm(r); return; }
  openModal('<div class="modal-h"><h3>' + esc(r.start) + '–' + esc(r.end) + ' · ' + esc(r.segment) + '</h3><button type="button" class="btn ghost sm" data-act="modal-cancel" aria-label="Close">✕</button></div><div class="modal-b one">' +
    (r.location ? '<div><span class="flow-loc">' + esc(r.location) + '</span></div>' : '') + rdDetail(r) + '</div>', 'sm', { allowReadonly: true });
}
function rundownForm(r, preset) {
  var isNew = !r;
  r = r || Object.assign({ group: 'flow', start: '', end: '', duration: '', segment: '', location: '', flow: '', concurrent: [], mcCue: '', av: '', ops: '', docs: '', pic: '', status: defaultStatus(), source: 'confirmed', verifyNote: '' }, preset || {});
  var locs = rdLocations('flow');
  var locList = '<datalist id="rdLocList">' + locs.map(function (l) { return '<option value="' + esc(l) + '">'; }).join('') + '</datalist>';
  openModal('<form id="rdForm" novalidate><div class="modal-h"><h3>' + (isNew ? 'Segmen Baru' : 'Edit Segmen') + '</h3><button type="button" class="btn ghost sm" data-act="modal-cancel" aria-label="Close">✕</button></div><div class="modal-b">' +
    field('segment', 'Segmen', inp('segment', r.segment, 'text', 'maxlength="160"'), { req: true, full: true }) +
    field('location', 'Lokasi', inp('location', r.location, 'text', 'list="rdLocList" maxlength="80"') + locList) +
    field('start', 'Mulai', inp('start', r.start, 'time'), { req: true }) +
    field('end', 'Selesai', inp('end', r.end, 'time'), { hint: 'Segmen dengan jam mulai & selesai yang sama tampil sebagai program paralel.' }) +
    picField(r.pic) +
    field('status', 'Status', sel('status', withCurrent(statusList(), r.status), r.status || defaultStatus()), { hint: canEdit() ? '<a href="#" data-act="manage-statuses">Kelola Status</a>' : '' }) +
    field('flow', 'Deskripsi / Alur', ta('flow', r.flow), { full: true }) +
    field('concurrent', 'Concurrent (Aktivitas Bersamaan)', ta('concurrent', (r.concurrent || []).join('\n')), { full: true, hint: 'Satu per baris. Tampil sebagai chip di Festival Flow.' }) +
    field('ops', 'Catatan', ta('ops', r.ops), { full: true, hint: 'Opsional: crew, props, cue MC, dll.' }) +
    field('duration', 'Durasi (Label)', inp('duration', r.duration, 'text', 'maxlength="30"'), { hint: 'Kosongkan untuk dihitung otomatis' }) +
    field('source', 'Data Source', sel('source', [{ value: 'confirmed', label: 'Confirmed' }, { value: 'verify', label: 'Needs Verification' }], r.source)) +
    field('verifyNote', 'Verification Note', inp('verifyNote', r.verifyNote, 'text', 'maxlength="300"')) +
    '</div><div class="modal-f">' + (isNew ? '' : '<button type="button" class="btn danger" data-act="delete-rundown" data-id="' + r.id + '">Hapus</button>') +
    '<div class="right"><button type="button" class="btn" data-act="modal-cancel">Cancel</button><button type="submit" class="btn primary">' + (isNew ? 'Tambah segmen' : 'Simpan') + '</button></div></div></form>', 'wide');
  document.getElementById('rdForm').onsubmit = function (e) {
    e.preventDefault();
    var v = {}, errs = {};
    new FormData(e.target).forEach(function (val, k) { v[k] = String(val).trim(); });
    if (!v.segment) errs.segment = 'Nama segmen wajib diisi.';
    if (!/^\d{2}:\d{2}$/.test(v.start)) errs.start = 'Isi jam mulai.';
    if (v.end && v.start && v.end <= v.start) errs.end = 'Jam selesai harus setelah jam mulai.';
    if (Object.keys(errs).length) return showErrors(e.target, errs);
    v.group = 'flow';
    v.concurrent = v.concurrent.split('\n').map(function (x) { return x.trim(); }).filter(Boolean);
    if (!v.duration && v.end) { var m = rdMinutes(v.end) - rdMinutes(v.start); v.duration = m >= 60 ? Math.floor(m / 60) + ' hr' + (m % 60 ? ' ' + (m % 60) + ' min' : '') : m + "'"; }
    if (isNew) { var o = Object.assign({ id: nextId('R'), order: db.rundown.length + 1 }, v, { updatedAt: Date.now() }); db.rundown.push(o); ui.rdOpen = o.id; closeModal(); commit('Segmen ditambahkan'); }
    else { Object.assign(r, v, { updatedAt: Date.now() }); closeModal(); commit('Segmen disimpan'); }
  };
}
function zoneById(id) { return (db.zones || []).filter(function (z) { return z.id === id; })[0] || null; }
function zoneForm(z) {
  if (!canEdit()) {
    if (!z) return;
    openModal('<div class="modal-h"><h3>' + esc(z.name) + '</h3><button type="button" class="btn ghost sm" data-act="modal-cancel" aria-label="Close">✕</button></div><div class="modal-b one"><div><span class="flow-loc">' + esc(z.kind === 'area' ? z.location : z.time) + '</span></div><p style="margin:0;white-space:pre-wrap">' + esc(z.detail || '') + '</p></div>', 'sm', { allowReadonly: true });
    return;
  }
  var isNew = !z; z = z || { kind: 'activity', name: '', time: '', location: '', detail: '', order: (db.zones || []).length + 1 };
  openModal('<form id="zoneForm" novalidate><div class="modal-h"><h3>' + (isNew ? 'Zona / Area Baru' : 'Edit ' + esc(z.name)) + '</h3><button type="button" class="btn ghost sm" data-act="modal-cancel" aria-label="Close">✕</button></div><div class="modal-b">' +
    field('name', 'Nama', inp('name', z.name, 'text', 'maxlength="80"'), { req: true }) +
    field('kind', 'Jenis', sel('kind', [{ value: 'activity', label: 'Aktivitas Paralel (Kartu Atas)' }, { value: 'area', label: 'Area Introduction' }], z.kind)) +
    field('time', 'Jam (Label)', inp('time', z.time, 'text', 'maxlength="40" placeholder="10:00–16:00 atau Start 09:00"')) +
    field('location', 'Lokasi', inp('location', z.location, 'text', 'maxlength="60"')) +
    field('detail', 'Detail', ta('detail', z.detail), { full: true, hint: 'Boleh beberapa baris.' }) +
    field('order', 'Urutan', inp('order', z.order, 'number', 'min="1" max="99"')) +
    '</div><div class="modal-f">' + (isNew ? '' : '<button type="button" class="btn danger" data-act="delete-zone" data-id="' + z.id + '">Hapus</button>') +
    '<div class="right"><button type="button" class="btn" data-act="modal-cancel">Cancel</button><button type="submit" class="btn primary">' + (isNew ? 'Tambah' : 'Simpan') + '</button></div></div></form>', 'sm');
  document.getElementById('zoneForm').onsubmit = function (e) {
    e.preventDefault();
    var v = {}; new FormData(e.target).forEach(function (val, k) { v[k] = String(val).trim(); });
    if (!v.name) return showErrors(e.target, { name: 'Nama wajib diisi.' });
    v.order = +v.order || 99;
    if (isNew) { db.zones.push(Object.assign({ id: nextId('Z') }, v)); closeModal(); commit('Zona ditambahkan'); }
    else { Object.assign(z, v); closeModal(); commit('Zona disimpan'); }
  };
}
function deleteZone(id) {
  var z = zoneById(id); if (!z) return;
  confirmDialog('Hapus "' + z.name + '"?', 'Kartu ini hilang dari halaman Rundown.', 'Hapus', function () { db.zones = db.zones.filter(function (x) { return x.id !== id; }); if (!db.zones.length) db.zonesCleared = true; commit('Zona dihapus'); });
}
function rdById(id) { return db.rundown.filter(function (r) { return r.id === id; })[0] || null; }
function deleteRundown(id) {
  var r = rdById(id); if (!r) return;
  confirmDialog('Hapus segmen?', '<b>' + esc(r.start) + ' · ' + esc(r.segment.split('\n')[0]) + '</b> akan dihapus dari rundown.', 'Hapus segmen', function () {
    db.rundown = db.rundown.filter(function (x) { return x.id !== id; }); if (!db.rundown.length) db.rundownCleared = true; if (ui.rdOpen === id) ui.rdOpen = null; commit('Segmen dihapus');
  });
}

/* ---------- Category manager (task categories + workstreams) ---------- */
var CAT_KINDS = {
  category: { label: 'Kategori Task', key: 'taskCategories', hint: 'Dipakai di kolom Category pada task.' },
  workstream: { label: 'Workstream / Program', key: 'workstreams', hint: 'Dipakai di task (Workstream) dan di Finance (Budget category).' },
  status: { label: 'Status Task', key: 'taskStatuses', hint: '' },
  pic: { label: 'PIC', key: 'pics', hint: 'Nama yang muncul di dropdown PIC (task & rundown).' },
  pay: { label: 'Status Payment', key: 'payStatuses', hint: '' }
};
function catTabs(kind) {
  return '<div class="tabs" role="tablist" style="padding:0 18px;margin:0">' + Object.keys(CAT_KINDS).map(function (k) { return '<button type="button" role="tab" data-act="cat-tab" data-kind="' + k + '" aria-selected="' + (k === kind) + '">' + CAT_KINDS[k].label + '</button>'; }).join('') + '</div>';
}
function statusUsage(name) { return db.tasks.filter(function (t) { return t.status === name; }).length + (db.rundown || []).filter(function (r) { return r.status === name; }).length; }
function statusManager() {
  var list = db.settings.taskStatuses;
  var rows = list.map(function (x, i) {
    return '<div class="st-row" data-ri="' + i + '">' + DRAG_GRIP + '<span class="badge b-' + esc(x.color) + '" aria-hidden="true">' + esc(x.name) + '</span>' +
      '<input class="input" id="st-name-' + i + '" data-st-idx="' + i + '" value="' + esc(x.name) + '" maxlength="40" aria-label="Nama status">' +
      '<select class="select" id="st-type-' + i + '" aria-label="Jenis status">' + opts(STATUS_TYPES, x.type) + '</select>' +
      '<select class="select" id="st-color-' + i + '" aria-label="Warna">' + opts(STATUS_COLORS, x.color) + '</select>' +
      '<span class="cat-use">' + statusUsage(x.name) + ' dipakai</span>' +
      '<span class="st-btns"><button class="btn sm" type="button" data-act="cat-move" data-kind="status" data-idx="' + i + '" data-dir="-1" aria-label="Naik"' + (i === 0 ? ' disabled' : '') + '>↑</button>' +
      '<button class="btn sm" type="button" data-act="cat-move" data-kind="status" data-idx="' + i + '" data-dir="1" aria-label="Turun"' + (i === list.length - 1 ? ' disabled' : '') + '>↓</button>' +
      '<button class="btn sm danger" type="button" data-act="cat-delete" data-kind="status" data-idx="' + i + '">Hapus</button></span></div>';
  }).join('');
  var noDone = !list.some(function (x) { return x.type === 'done'; });
  openModal('<form id="stForm" novalidate><div class="modal-h"><h3>Manage Categories</h3><button type="button" class="btn ghost sm" data-act="modal-cancel" aria-label="Close">✕</button></div>' + catTabs('status') +
    '<div class="modal-b one"><p class="muted" style="margin:0">Status yang dipilih di task. <b>Jenis</b> menentukan perilakunya: <i>Selesai</i> dihitung sebagai task selesai (dicoret, masuk KPI Completed), <i>Terhambat</i> wajib isi blocker dan masuk daftar urgent, <i>Menunggu</i> masuk KPI Pending & tab Pending, <i>Berjalan</i> masuk KPI In progress. Ganti nama otomatis memperbarui semua task.</p>' +
    (noDone ? '<div class="banner warn" style="margin:0">Belum ada status berjenis <b>Selesai</b>, jadi tidak ada task yang dihitung selesai.</div>' : '') +
    '<div class="cat-list" data-reorder="cat:status">' + rows + '</div>' +
    '<div class="cat-add"><input class="input" id="stNew" placeholder="Nama status baru, mis. Waiting Vendor" maxlength="40"><select class="select" id="stNewType" aria-label="Jenis">' + opts(STATUS_TYPES, 'progress') + '</select><button type="button" class="btn" data-act="cat-add" data-kind="status">+ Tambah</button></div>' +
    '<div class="form-err" id="catErr" hidden></div></div>' +
    '<div class="modal-f"><div class="right"><button type="button" class="btn" data-act="modal-cancel">Tutup</button><button type="submit" class="btn primary">Simpan Perubahan</button></div></div></form>', 'wide');
  document.getElementById('stForm').onsubmit = function (e) {
    e.preventDefault();
    var next = [], renames = [], names = [];
    for (var i = 0; i < list.length; i++) {
      var nm = document.getElementById('st-name-' + i).value.trim();
      if (!nm) { catErr('Nama status tidak boleh kosong.'); return; }
      if (names.indexOf(nm.toLowerCase()) > -1) { catErr('Nama "' + nm + '" dipakai dua kali.'); return; }
      names.push(nm.toLowerCase());
      next.push({ name: nm, type: document.getElementById('st-type-' + i).value, color: document.getElementById('st-color-' + i).value });
      if (nm !== list[i].name) renames.push([list[i].name, nm]);
    }
    var moved = 0;
    renames.forEach(function (r) { db.tasks.concat(db.rundown || []).forEach(function (t) { if (t.status === r[0]) { t.status = r[1]; t.updatedAt = Date.now(); moved++; } }); ui.fStatus = ui.fStatus.map(function (x) { return x === r[0] ? r[1] : x; }); });
    var blockedNoReason = 0;
    db.settings.taskStatuses = next; closeModal();
    commit('Status disimpan' + (moved ? ' · ' + moved + ' task diperbarui' : '') + (blockedNoReason ? ' · ' + blockedNoReason + ' task terhambat belum punya blocker' : ''));
  };
}
function payManager() {
  var list = db.settings.payStatuses;
  var rows = list.map(function (x, i) {
    var used = db.finance.filter(function (f) { return f.paymentStatus === x.name; }).length;
    return '<div class="st-row" data-ri="' + i + '">' + DRAG_GRIP + '<span class="badge b-' + esc(x.color) + '" aria-hidden="true">' + esc(x.name) + '</span>' +
      '<input class="input" id="pay-name-' + i + '" value="' + esc(x.name) + '" maxlength="40" aria-label="Nama status payment">' +
      '<select class="select" id="pay-type-' + i + '" aria-label="Jenis">' + opts(PAY_TYPES, x.type) + '</select>' +
      '<select class="select" id="pay-color-' + i + '" aria-label="Warna">' + opts(STATUS_COLORS, x.color) + '</select>' +
      '<span class="cat-use">' + used + ' dipakai</span>' +
      '<span class="st-btns"><button class="btn sm" type="button" data-act="cat-move" data-kind="pay" data-idx="' + i + '" data-dir="-1" aria-label="Naik"' + (i === 0 ? ' disabled' : '') + '>↑</button>' +
      '<button class="btn sm" type="button" data-act="cat-move" data-kind="pay" data-idx="' + i + '" data-dir="1" aria-label="Turun"' + (i === list.length - 1 ? ' disabled' : '') + '>↓</button>' +
      '<button class="btn sm danger" type="button" data-act="cat-delete" data-kind="pay" data-idx="' + i + '">Hapus</button></span></div>';
  }).join('');
  openModal('<form id="payForm" novalidate><div class="modal-h"><h3>Manage Categories</h3><button type="button" class="btn ghost sm" data-act="modal-cancel" aria-label="Close">✕</button></div>' + catTabs('pay') +
    '<div class="modal-b one"><p class="muted" style="margin:0">Pilihan di dropdown Payment status (Finance). <b>Jenis</b> menentukan hitungan: <i>Belum Bayar</i> = dibayar Rp 0, <i>Bayar Sebagian (DP)</i> = dibayar sebesar DP, <i>Lunas</i> = dibayar penuh. Kalau kolom "Total transferred" diisi, angka itu yang dipakai. Ganti nama otomatis memperbarui semua item budget.</p>' +
    '<div class="cat-list" data-reorder="cat:pay">' + rows + '</div>' +
    '<div class="cat-add"><input class="input" id="payNew" placeholder="Nama status baru, mis. Waiting Invoice" maxlength="40"><select class="select" id="payNewType" aria-label="Jenis">' + opts(PAY_TYPES, 'unpaid') + '</select><button type="button" class="btn" data-act="cat-add" data-kind="pay">+ Tambah</button></div>' +
    '<div class="form-err" id="catErr" hidden></div></div>' +
    '<div class="modal-f"><div class="right"><button type="button" class="btn" data-act="modal-cancel">Tutup</button><button type="submit" class="btn primary">Simpan Perubahan</button></div></div></form>', 'wide');
  document.getElementById('payForm').onsubmit = function (e) {
    e.preventDefault();
    var next = [], names = [], moved = 0;
    for (var i = 0; i < list.length; i++) {
      var nm = document.getElementById('pay-name-' + i).value.trim();
      if (!nm) { catErr('Nama status tidak boleh kosong.'); return; }
      if (names.indexOf(nm.toLowerCase()) > -1) { catErr('Nama "' + nm + '" dipakai dua kali.'); return; }
      names.push(nm.toLowerCase());
      next.push({ name: nm, type: document.getElementById('pay-type-' + i).value, color: document.getElementById('pay-color-' + i).value });
      if (nm !== list[i].name) {
        var from = list[i].name;
        db.finance.forEach(function (f) { if (f.paymentStatus === from) { f.paymentStatus = nm; f.updatedAt = Date.now(); moved++; } });
        if (ui.finPay === from) ui.finPay = nm;
      }
    }
    db.settings.payStatuses = next; closeModal();
    commit('Status payment disimpan' + (moved ? ' · ' + moved + ' item diperbarui' : ''));
  };
}
function catUsage(kind, name) {
  if (kind === 'pic') return { tasks: db.tasks.concat(db.rundown || []).filter(function (t) { return picsOf(t.pic).indexOf(name) > -1; }).length, finance: 0 };
  if (kind === 'category') return { tasks: db.tasks.filter(function (t) { return t.category === name; }).length, finance: 0 };
  return { tasks: db.tasks.filter(function (t) { return taskWorkstreams(t).indexOf(name) > -1; }).length, finance: db.finance.filter(function (f) { return f.workstream === name; }).length };
}
function categoryManager(kind) {
  kind = kind || 'category';
  if (kind === 'status') return statusManager();
  if (kind === 'pay') return payManager();
  var K = CAT_KINDS[kind], list = db.settings[K.key];
  var unlisted = [];
  (kind === 'pic' ? [].concat.apply([], db.tasks.concat(db.rundown || []).map(function (t) { return picsOf(t.pic); })) : kind === 'category' ? db.tasks.map(function (t) { return t.category; }) : db.tasks.concat(db.finance).map(function (r) { return r.workstream; }))
    .forEach(function (v) { if (v && list.indexOf(v) < 0 && unlisted.indexOf(v) < 0) unlisted.push(v); });
  var rows = list.map(function (name, i) {
    var u = catUsage(kind, name);
    return '<div class="cat-row" data-ri="' + i + '">' + DRAG_GRIP + '<input class="input" id="cat-' + i + '" data-cat-idx="' + i + '" value="' + esc(name) + '" aria-label="Nama ' + esc(name) + '" maxlength="60">' +
      '<span class="cat-use">' + u.tasks + ' task' + (kind === 'workstream' ? ' · ' + u.finance + ' budget' : '') + '</span>' +
      '<button class="btn sm" type="button" data-act="cat-move" data-kind="' + kind + '" data-idx="' + i + '" data-dir="-1" aria-label="Naik"' + (i === 0 ? ' disabled' : '') + '>↑</button>' +
      '<button class="btn sm" type="button" data-act="cat-move" data-kind="' + kind + '" data-idx="' + i + '" data-dir="1" aria-label="Turun"' + (i === list.length - 1 ? ' disabled' : '') + '>↓</button>' +
      '<button class="btn sm danger" type="button" data-act="cat-delete" data-kind="' + kind + '" data-idx="' + i + '">Hapus</button></div>';
  }).join('');
  openModal('<form id="catForm" novalidate><div class="modal-h"><h3>Manage Categories</h3><button type="button" class="btn ghost sm" data-act="modal-cancel" aria-label="Close">✕</button></div>' +
    catTabs(kind) +
    '<div class="modal-b one"><p class="muted" style="margin:0">' + K.hint + ' Ganti nama langsung di kotaknya; semua task/budget yang memakai nama lama ikut diganti. Drag ⋮⋮ untuk ubah urutan; urutan ini juga dipakai di dropdown dan filter tabel.</p>' +
    '<div class="cat-list" data-reorder="cat:' + kind + '">' + (rows || '<p class="faint">Belum ada.</p>') + '</div>' +
    (unlisted.length ? '<div class="banner warn" style="margin:0">Dipakai di data tapi belum ada di daftar: ' + unlisted.map(function (u) { return '<button type="button" class="btn sm" data-act="cat-adopt" data-kind="' + kind + '" data-name="' + esc(u) + '">+ ' + esc(u) + '</button>'; }).join(' ') + '</div>' : '') +
    '<div class="cat-add"><input class="input" id="catNew" placeholder="Nama ' + K.label.toLowerCase() + ' baru" maxlength="60"><button type="button" class="btn" data-act="cat-add" data-kind="' + kind + '">+ Tambah</button></div>' +
    '<div class="form-err" id="catErr" hidden></div></div>' +
    '<div class="modal-f"><div class="right"><button type="button" class="btn" data-act="modal-cancel">Tutup</button><button type="submit" class="btn primary">Simpan Nama</button></div></div></form>', 'wide');
  var form = document.getElementById('catForm');
  form.dataset.kind = kind;
  form.onsubmit = function (e) { e.preventDefault(); applyCatRenames(kind); };
  var nw = document.getElementById('catNew'); if (nw) nw.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); catAdd(kind); } });
}
function catErr(msg) { var el = document.getElementById('catErr'); if (el) { el.textContent = msg; el.hidden = !msg; } }
function catRename(kind, from, to) {
  var n = 0;
  if (kind === 'pic') db.tasks.concat(db.rundown || []).forEach(function (t) { var a = picsOf(t.pic), k = a.indexOf(from); if (k > -1) { a[k] = to; t.pic = picJoin(a); t.updatedAt = Date.now(); n++; } });
  else if (kind === 'category') db.tasks.forEach(function (t) { if (t.category === from) { t.category = to; t.updatedAt = Date.now(); n++; } });
  else db.tasks.concat(db.finance).forEach(function (r) {
    var hit = r.workstream === from;
    if (hit) r.workstream = to;
    if (Array.isArray(r.workstreams) && r.workstreams.indexOf(from) > -1) {
      r.workstreams = r.workstreams.map(function (w) { return w === from ? to : w; }).filter(function (w, i, a) { return a.indexOf(w) === i; });
      hit = true;
    }
    if (hit) { r.updatedAt = Date.now(); n++; }
  });
  if (kind === 'workstream') {
    ui.fWs = ui.fWs.map(function (x) { return x === from ? to : x; });
    ui.mtHide = (ui.mtHide || []).map(function (x) { return x === from ? to : x; });
    if (ui.colF && ui.colF.workstream && Array.isArray(ui.colF.workstream.v)) ui.colF.workstream.v = ui.colF.workstream.v.map(function (x) { return x === from ? to : x; });
    var org = db.settings.wsOrigin = db.settings.wsOrigin || {}, base = org[from] || from;
    delete org[from];
    if (base !== to) org[to] = base;
  }
  if (kind === 'workstream' && ui.finWs === from) ui.finWs = to;
  return n;
}
function applyCatRenames(kind) {
  var K = CAT_KINDS[kind], list = db.settings[K.key], next = [], changes = [], moved = 0;
  var inputs = document.querySelectorAll('[data-cat-idx]');
  for (var i = 0; i < inputs.length; i++) {
    var v = inputs[i].value.trim(), old = list[+inputs[i].dataset.catIdx];
    if (!v) { catErr('Nama tidak boleh kosong.'); inputs[i].focus(); return; }
    if (next.map(function (x) { return x.toLowerCase(); }).indexOf(v.toLowerCase()) > -1) { catErr('Nama "' + v + '" dipakai dua kali.'); inputs[i].focus(); return; }
    next.push(v); if (v !== old) changes.push([old, v]);
  }
  if (!changes.length) { closeModal(); return; }
  changes.forEach(function (c) { moved += catRename(kind, c[0], c[1]); });
  db.settings[K.key] = next; closeModal();
  commit(changes.length + ' nama diganti' + (moved ? ' · ' + moved + ' record ikut diperbarui' : ''));
}
function catAdd(kind) {
  if (kind === 'pay') {
    var pn = (document.getElementById('payNew').value || '').trim(), pt = document.getElementById('payNewType').value;
    if (!pn) { catErr('Isi nama status payment dulu.'); return; }
    if (db.settings.payStatuses.some(function (x) { return x.name.toLowerCase() === pn.toLowerCase(); })) { catErr('"' + pn + '" sudah ada.'); return; }
    db.settings.payStatuses.push({ name: pn, type: pt, color: { unpaid: 'warn', partial: 'info', paid: 'ok' }[pt] });
    persist(db); render(); payManager(); toast('Status payment "' + pn + '" ditambahkan'); return;
  }
  if (kind === 'status') {
    var nm = (document.getElementById('stNew').value || '').trim(), ty = document.getElementById('stNewType').value;
    if (!nm) { catErr('Isi nama status dulu.'); return; }
    if (db.settings.taskStatuses.some(function (x) { return x.name.toLowerCase() === nm.toLowerCase(); })) { catErr('"' + nm + '" sudah ada.'); return; }
    var col = { todo: 'neutral', progress: 'info', pending: 'warn', blocked: 'crit', done: 'ok' }[ty] || 'neutral';
    var doneIdx = db.settings.taskStatuses.findIndex(function (x) { return x.type === 'done'; });
    if (ty !== 'done' && doneIdx > -1) db.settings.taskStatuses.splice(doneIdx, 0, { name: nm, type: ty, color: col }); else db.settings.taskStatuses.push({ name: nm, type: ty, color: col });
    persist(db); render(); statusManager(); toast('Status "' + nm + '" ditambahkan'); return;
  }
  var K = CAT_KINDS[kind], el = document.getElementById('catNew'), v = (el && el.value || '').trim();
  if (!v) { catErr('Isi nama dulu.'); return; }
  if (db.settings[K.key].some(function (x) { return x.toLowerCase() === v.toLowerCase(); })) { catErr('"' + v + '" sudah ada.'); return; }
  db.settings[K.key].push(v); persist(db); render(); categoryManager(kind); toast('"' + v + '" ditambahkan');
}
function catDelete(kind, idx) {
  if (kind === 'pay') {
    var PL = db.settings.payStatuses, ps = PL[idx]; if (!ps) return;
    var pused = db.finance.filter(function (f) { return f.paymentStatus === ps.name; }).length, prest = PL.filter(function (_, i) { return i !== idx; });
    if (!prest.length) { toast('Minimal harus ada satu status payment.', true); return; }
    if (!pused) { confirmDialog('Hapus status "' + ps.name + '"?', 'Tidak ada item budget yang memakai status ini.', 'Hapus', function () { db.settings.payStatuses = prest; commit('Status payment dihapus'); payManager(); }); return; }
    openModal('<form id="payDelForm" novalidate><div class="modal-h"><h3>Hapus status "' + esc(ps.name) + '"?</h3></div><div class="modal-b one"><p style="margin:0">Masih dipakai oleh <b>' + pused + ' item budget</b>. Pindahkan ke:</p>' +
      field('moveTo', 'Status Pengganti', sel('moveTo', prest.map(function (x) { return x.name; }), prest[0].name)) + '</div>' +
      '<div class="modal-f"><div class="right"><button type="button" class="btn" data-act="cat-tab" data-kind="pay">Batal</button><button type="submit" class="btn danger solid">Pindahkan &amp; Hapus</button></div></div></form>', 'sm');
    document.getElementById('payDelForm').onsubmit = function (e) {
      e.preventDefault(); var to = e.target.moveTo.value, n = 0;
      db.finance.forEach(function (f) { if (f.paymentStatus === ps.name) { f.paymentStatus = to; f.updatedAt = Date.now(); n++; } });
      if (ui.finPay === ps.name) ui.finPay = '';
      db.settings.payStatuses = prest; closeModal(); commit('Status "' + ps.name + '" dihapus · ' + n + ' item dipindah ke "' + to + '"'); payManager();
    };
    return;
  }
  if (kind === 'status') {
    var L = db.settings.taskStatuses, st = L[idx]; if (!st) return;
    var used = statusUsage(st.name), rest = L.filter(function (_, i) { return i !== idx; });
    if (!rest.length) { toast('Minimal harus ada satu status.', true); return; }
    if (!used) {
      confirmDialog('Hapus status "' + st.name + '"?', 'Tidak ada task yang memakai status ini.', 'Hapus', function () { db.settings.taskStatuses = rest; commit('Status dihapus'); statusManager(); });
      return;
    }
    openModal('<form id="stDelForm" novalidate><div class="modal-h"><h3>Hapus status "' + esc(st.name) + '"?</h3></div><div class="modal-b one"><p style="margin:0">Masih dipakai oleh <b>' + used + ' task/segmen rundown</b>. Pindahkan ke:</p>' +
      field('moveTo', 'Status Pengganti', sel('moveTo', rest.map(function (x) { return x.name; }), defaultStatus() === st.name ? rest[0].name : defaultStatus())) + '</div>' +
      '<div class="modal-f"><div class="right"><button type="button" class="btn" data-act="cat-tab" data-kind="status">Batal</button><button type="submit" class="btn danger solid">Pindahkan &amp; Hapus</button></div></div></form>', 'sm');
    document.getElementById('stDelForm').onsubmit = function (e) {
      e.preventDefault(); var to = e.target.moveTo.value, n = 0;
      db.tasks.concat(db.rundown || []).forEach(function (t) { if (t.status === st.name) { t.status = to; t.updatedAt = Date.now(); n++; } });
      ui.fStatus = ui.fStatus.filter(function (x) { return x !== st.name; });
      db.settings.taskStatuses = rest; closeModal(); commit('Status "' + st.name + '" dihapus · ' + n + ' task dipindah ke "' + to + '"'); statusManager();
    };
    return;
  }
  var K = CAT_KINDS[kind], list = db.settings[K.key], name = list[idx], u = catUsage(kind, name), total = u.tasks + u.finance;
  if (!total) {
    confirmDialog('Hapus "' + name + '"?', 'Tidak ada task' + (kind === 'workstream' ? '/budget' : '') + ' yang memakai ini.', 'Hapus', function () {
      db.settings[K.key] = list.filter(function (_, i) { return i !== idx; }); commit('"' + name + '" dihapus'); categoryManager(kind);
    });
    return;
  }
  var others = list.filter(function (_, i) { return i !== idx; });
  if (!others.length) { toast('Tambah ' + K.label.toLowerCase() + ' lain dulu sebelum menghapus yang terakhir.', true); return; }
  openModal('<form id="catDelForm" novalidate><div class="modal-h"><h3>Hapus "' + esc(name) + '"?</h3></div><div class="modal-b one"><p style="margin:0">Masih dipakai oleh <b>' + u.tasks + ' task</b>' + (kind === 'workstream' ? ' dan <b>' + u.finance + ' baris budget</b>' : '') + '. Pindahkan ke:</p>' +
    field('moveTo', 'Pindahkan Ke', sel('moveTo', others, others[0])) + '</div>' +
    '<div class="modal-f"><div class="right"><button type="button" class="btn" data-act="cat-tab" data-kind="' + kind + '">Batal</button><button type="submit" class="btn danger solid">Pindahkan &amp; Hapus</button></div></div></form>', 'sm');
  document.getElementById('catDelForm').onsubmit = function (e) {
    e.preventDefault();
    var to = e.target.moveTo.value, n = catRename(kind, name, to);
    db.settings[K.key] = db.settings[K.key].filter(function (x) { return x !== name; });
    closeModal(); commit('"' + name + '" dihapus · ' + n + ' record dipindah ke "' + to + '"'); categoryManager(kind);
  };
}

/* ---------- Overview ---------- */
function renderOverview() {
  // v14: lighter overview — 4 summary cards, two short lists, compact workstream progress; details live in Tasks / Finance
  var s = taskStats(), ft = totals(db.finance), today = todayISO();
  var h = pageHead('Overview', 'Today\'s summary, ' + fmtDate(today) + '. Full details are in Tasks and Finance.',
    '<button class="btn" data-act="new-task">+ Task</button><button class="btn primary" data-act="new-fin">+ Budget Item</button>');
  var urgent = db.tasks.filter(function (t) { var k = dueState(t).kind; return !isDone(t) && (k === 'overdue' || k === 'soon' || sType(t.status) === 'blocked'); })
    .sort(function (a, b) { return (a.deadline || '9') < (b.deadline || '9') ? -1 : 1; });
  var upcoming = db.tasks.filter(function (t) { var d = dueState(t); return !isDone(t) && d.kind !== 'none' && d.kind !== 'overdue' && d.kind !== 'soon' && d.days >= 0 && d.days <= 14; })
    .sort(function (a, b) { return a.deadline < b.deadline ? -1 : 1; });
  var pct = s.total ? Math.round(s.done / s.total * 100) : 0, payPct = ft.est ? Math.min(100, Math.round(ft.paid / ft.est * 100)) : 0;
  h += '<div class="ov-cards">' +
    ovCard('Task Progress', pct + '%', s.done + ' of ' + s.total + ' tasks done', pct, '', 'go-tasks', 'all') +
    ovCard('Needs Attention', s.overdue + s.blocked, s.overdue + ' overdue · ' + s.blocked + ' blocked', null, s.overdue + s.blocked > 0 ? 'warn' : '', 'go-tasks', 'pending') +
    ovCard('Due in 14 Days', urgent.filter(function (t) { return dueState(t).kind === 'soon'; }).length + upcoming.length, 'open tasks', null, '', 'go-tasks', 'timeline') +
    ovCard('Paid', rpShort(ft.paid), 'of ' + rpShort(ft.est) + ' · ' + rpShort(ft.outstanding) + ' outstanding', payPct, '', 'go-page', 'finance') +
    '</div>';
  h += '<div class="grid-2 ov-lists">' +
    ovList('Needs Attention', 'Overdue, due within 3 days, or blocked', urgent, 'pending', 'Nothing urgent right now.') +
    ovList('Upcoming Deadlines', 'Due in the next 4–14 days', upcoming, 'timeline', 'No deadlines in the next 14 days.') +
    '</div>';
  // Prep strip
  h += '<div class="panel-h" style="border:none;padding:0 0 8px"><h2>Preparation Deadlines</h2><span class="muted" style="font-size:12px">Event Day 21 Nov 2026</span></div><div class="prep-strip">';
  var nextFound = false;
  PREP_DEADLINES.forEach(function (d) {
    var t = db.tasks.filter(function (x) { return x.category === 'Preparation' && x.deadline === d; })[0];
    var due = db.tasks.filter(function (x) { return x.deadline === d && x.category !== 'Preparation'; }).length;
    var cls = d < today ? 'past' : (!nextFound ? (nextFound = true, 'next') : '');
    h += '<div class="' + cls + '" data-act="open-task" data-id="' + (t ? t.id : '') + '" role="button" tabindex="0"><div class="m">' + MONTHS[parseISO(d).getMonth()].toUpperCase() + '</div><div class="d">' + parseISO(d).getDate() + '</div><div style="margin-top:4px">' + (t ? statusBadge(t.status) : '<span class="faint">—</span>') + '</div><div class="faint" style="font-size:11px;margin-top:3px">' + due + ' other due</div></div>';
  });
  h += '</div>';
  // compact progress per workstream (only workstreams that have tasks), order from Manage Categories
  var wsRows = allWorkstreams().map(function (ws) {
    var ts = db.tasks.filter(function (t) { return taskWorkstreams(t).indexOf(ws) > -1; });
    if (!ts.length) return '';
    var done = ts.filter(isDone).length, p = Math.round(done / ts.length * 100), c = wsColor(ws);
    return '<div class="ov-ws"><span class="ov-ws-n"><i style="background:' + c[0] + '"></i>' + esc(ws) + '</span><div class="ov-bar"><i style="width:' + p + '%;background:' + c[0] + '"></i></div><span class="ov-ws-c num">' + done + '/' + ts.length + '</span></div>';
  }).join('');
  h += '<div class="panel ov-panel"><div class="panel-h"><h2>Progress by Workstream</h2><span class="muted" style="font-size:12px">tasks done / total</span></div><div class="ov-ws-grid">' + wsRows + '</div></div>';
  // verification: folded by default
  var vItems = [];
  db.finance.forEach(function (f) { var c = calc(f); if (c.flags.length || f.source === 'verify') vItems.push({ kind: 'fin', id: f.id, title: f.item, ws: f.workstream, msgs: (f.verifyNote ? [f.verifyNote] : []).concat(c.flags.map(function (x) { return x.msg; })) }); });
  db.tasks.forEach(function (t) { if (t.source === 'verify') vItems.push({ kind: 'task', id: t.id, title: t.name, ws: t.workstream, msgs: [t.verifyNote || 'Needs Verification'] }); });
  if (vItems.length) h += '<details class="panel ov-verify"><summary><b>Needs Verification</b><span class="ov-pill">' + vItems.length + '</span><span class="muted">budget and task records to double-check · click to view</span></summary><div class="verify-list">' +
    vItems.map(function (v) {
      return '<div class="v-row" data-act="' + (v.kind === 'fin' ? 'edit-fin' : 'open-task') + '" data-id="' + v.id + '" role="button" tabindex="0"><div style="display:flex;gap:8px;align-items:center;min-width:0">' + wsTag(v.ws) + '<b style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(v.title) + '</b></div><div class="muted" style="font-size:12px">' + esc(v.msgs.join(' · ')) + '</div></div>';
    }).join('') + '</div></details>';
  return h;
}
// short English amounts for the Overview: Rp 82.6M, Rp 1.2B
function rpShort(n) {
  if (n == null || isNaN(n)) return '—';
  var a = Math.abs(n);
  if (a >= 1e9) return 'Rp ' + (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
  if (a >= 1e6) return 'Rp ' + (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  return rp(n);
}
function ovCard(k, v, sub, bar, tone, act, arg) {
  var at = act === 'go-page' ? ' data-act="go-page" data-page="' + arg + '"' : ' data-act="' + act + '" data-view="' + arg + '"';
  return '<button type="button" class="ov-card' + (tone ? ' ' + tone : '') + '"' + at + '><span class="k">' + k + '</span><span class="v">' + v + '</span>' +
    (bar != null ? '<span class="ov-bar"><i style="width:' + bar + '%"></i></span>' : '') + '<span class="s">' + sub + '</span></button>';
}
function ovList(title, sub, list, view, empty) {
  var LIM = 6;
  var rows = list.slice(0, LIM).map(function (t) {
    var c = wsColor(t.workstream);
    return '<div class="ov-row" data-act="open-task" data-id="' + t.id + '" role="button" tabindex="0"><i class="ov-dot" style="background:' + c[0] + '" title="' + esc(t.workstream) + '"></i>' +
      '<span class="ov-t"><b>' + esc(t.name) + '</b><span class="muted">' + esc(t.workstream || '—') + ' · ' + dueLabel(t) + '</span></span></div>';
  }).join('');
  return '<div class="panel ov-panel"><div class="panel-h"><div><h2>' + title + ' <span class="ov-pill">' + list.length + '</span></h2><span class="muted" style="font-size:12px">' + sub + '</span></div></div>' +
    '<div class="ov-rows">' + (rows || '<div class="empty" style="padding:18px">' + esc(empty) + '</div>') + '</div>' +
    (list.length > LIM ? '<div class="ov-more"><button class="btn sm ghost" data-act="go-tasks" data-view="' + view + '">View all ' + list.length + ' →</button></div>' : '') + '</div>';
}
function kpi(k, v, s, hl, money) { return '<div class="kpi' + (hl ? ' hl' : '') + '"><span class="k">' + k + '</span><span class="v' + (money ? ' money' : '') + '">' + v + '</span><span class="s">' + s + '</span></div>'; }
function panel(title, count, body) { return '<div class="panel"><div class="panel-h"><h2>' + title + '</h2><span class="num muted">' + count + '</span></div><div class="panel-b">' + body + '</div></div>'; }
function emptyBox(t, s) { return '<div class="empty"><b>' + esc(t) + '</b>' + esc(s) + '</div>'; }
function more(n, lim, view) { return n > lim ? '<div style="padding:6px 14px"><button class="btn sm ghost" data-act="go-tasks" data-view="' + view + '">View All ' + n + ' →</button></div>' : ''; }
function listRow(t) {
  return '<div class="list-row" data-act="open-task" data-id="' + t.id + '" role="button" tabindex="0"><span>' + wsTags(t) + '</span><span class="t">' + esc(t.name) + '<br><span style="font-size:12px">' + dueLabel(t) + '</span></span><span>' + statusBadge(t.status) + '</span></div>';
}

/* ---------- Tasks ---------- */
// deadline order across the WHOLE list. dir -1 = newest first, 1 = oldest first. Tasks without a deadline always come last.
function dlCmp(a, b, dir) {
  var x = a.deadline || '', y = b.deadline || '';
  if (x === y) return 0;
  if (!x) return 1;
  if (!y) return -1;
  return (x < y ? -1 : 1) * dir;
}
function filteredTasks(view) {
  var q = ui.q.trim().toLowerCase();
  var list = db.tasks.filter(function (t) {
    var taskWs = taskWorkstreams(t).concat(taskFinWs(t));
    if (ui.fWs.length && !ui.fWs.some(function (w) { return taskWs.indexOf(w) > -1; })) return false;
    if (ui.fStatus.length && ui.fStatus.indexOf(t.status) < 0) return false;
    if (ui.fSrc && t.source !== ui.fSrc) return false;
    if (!colFilterOk(t)) return false;
    if (q && [t.name, taskWs.join(' '), t.workstream, t.category, t.pic, t.notes, t.blockers, t.dependencies, t.id, finForTask(t.id).map(function (f) { return f.item; }).join(' ')].concat(Object.keys(t.cf || {}).map(function (k) { return t.cf[k]; })).join(' ').toLowerCase().indexOf(q) < 0) return false;
    if (view === 'operational' && t.category === 'Procurement') return false;
    if (view === 'procurement' && !(t.category === 'Procurement' || finForTask(t.id).length)) return false;
    if (view === 'pending') { var k = dueState(t).kind; var ty = sType(t.status); if (!(ty === 'pending' || ty === 'blocked' || k === 'overdue')) return false; }
    return true;
  });
  var key = ui.sort.key, dir = ui.sort.dir, pos = {};
  db.tasks.forEach(function (t, i) { pos[t.id] = i; });
  var sl = statusList();
  list.sort(function (a, b) {
    if (key === 'deadline') return dlCmp(a, b, dir) || String(a.name).localeCompare(String(b.name)) || (pos[a.id] - pos[b.id]);
    var va, vb;
    if (key === 'status') { va = TYPE_ORDER[sType(a.status)] * 100 + sl.indexOf(a.status); vb = TYPE_ORDER[sType(b.status)] * 100 + sl.indexOf(b.status); }
    else if (key.indexOf('cf:') === 0) { var ck = key.slice(3), xa = cfVal(a, ck), xb = cfVal(b, ck); va = typeof xa === 'number' ? xa : String(xa == null ? '\uffff' : xa).toLowerCase(); vb = typeof xb === 'number' ? xb : String(xb == null ? '\uffff' : xb).toLowerCase(); }
    else { va = String(a[key] || '').toLowerCase(); vb = String(b[key] || '').toLowerCase(); }
    if (va < vb) return -dir; if (va > vb) return dir;
    return dlCmp(a, b, -1) || (pos[a.id] - pos[b.id]);
  });
  return list;
}

function renderTasks() {
  var views = [['all', 'All Tasks'], ['procurement', 'Finance & Procurement'], ['operational', 'Operational'], ['pending', 'Pending'], ['timeline', 'Timeline']];
  var h = pageHead('Task Management', 'Satu database task. Status operasional terpisah dari status pembayaran.' + (ui.sort.key === 'deadline' && ui.sort.dir < 0 ? ' Urutan otomatis: deadline terbaru di atas.' : ''), '<button class="btn" data-act="manage-columns" data-table="tasks">Manage Columns</button><button class="btn" data-act="manage-categories">Manage Categories</button><button class="btn primary" data-act="new-task">+ New Task</button>');
  h += '<div class="tabs" role="tablist">' + views.map(function (v) {
    return '<button role="tab" data-act="task-view" data-view="' + v[0] + '" aria-selected="' + (ui.taskView === v[0]) + '">' + v[1] + '<span class="c">' + filteredTasks(v[0]).length + '</span></button>';
  }).join('') + '</div>';
  h += '<div class="toolbar">' +
    '<input class="input search" id="taskSearch" type="search" placeholder="Search task, PIC, notes…" value="' + esc(ui.q) + '" aria-label="Search tasks">' +
    '<select class="select" id="fSrc" aria-label="Data Source">' + opts([{ value: 'confirmed', label: 'Confirmed' }, { value: 'verify', label: 'Needs Verification' }], ui.fSrc, 'All Sources') + '</select>' +
    ((ui.q || ui.fWs.length || ui.fStatus.length || ui.fSrc || colFilterActive()) ? '<button class="btn ghost sm" data-act="clear-filters">Clear Filters</button>' : '') +
    (ui.taskView !== 'timeline' ? '<button class="btn sm fin-all-btn" data-act="task-fin-all" aria-pressed="' + !ui.tfHide + '">' + (ui.tfHide ? 'Tampilkan Item Finance' : 'Sembunyikan Item Finance') + '</button>' : '') + '</div>';
  var list = filteredTasks(ui.taskView);
  if (!db.tasks.length) return h + '<div class="table-wrap">' + emptyBox('No Tasks Yet', 'Create the first task to get started.') + '</div>';
  if (!list.length) return h + '<div class="table-wrap">' + emptyBox('No Tasks Match', ui.taskView === 'pending' ? 'Nothing pending approval, blocked or overdue with these filters.' : 'Try a different search or clear the filters.') + '</div>';
  if (ui.taskView === 'timeline') return h + renderTimeline(list);
  if (ui.taskView === 'operational') return h + taskTable(list, false);
  return h + taskTable(list, false, ui.taskView === 'pending');
}
// same order as the Master Timeline: by start date (or deadline when there is no start), then deadline; undated last
// dropdown with checkboxes: pick any number of values (empty = all)
function multiSelect(key, allLabel, noun, list) {
  var sel = (ui[key] || []).filter(function (v) { return list.indexOf(v) > -1 || true; });
  var label = !sel.length ? allLabel : sel.length === 1 ? sel[0] : sel.length + ' ' + noun + ' dipilih';
  return '<details class="msel' + (sel.length ? ' on' : '') + '" data-ms-box="' + key + '"' + (ui.msOpen === key ? ' open' : '') + '><summary class="select">' + esc(label) + '</summary><div class="msel-pop">' +
    list.map(function (v) { return '<label class="msel-opt"><input type="checkbox" data-ms="' + key + '" value="' + esc(v) + '"' + (sel.indexOf(v) > -1 ? ' checked' : '') + '> ' + esc(v) + '</label>'; }).join('') +
    (sel.length ? '<button type="button" class="btn sm ghost" data-act="ms-clear" data-key="' + key + '">Tampilkan Semua</button>' : '') + '</div></details>';
}
function picList() { return (db.settings.pics || []).slice(); }
// a PIC field can hold several people, stored as "Putri, Esi"
function picsOf(v) { return String(v || '').split(/\s*[,;\/]\s*|\s+&\s+/).map(function (x) { return x.trim(); }).filter(function (x, i, a) { return x && a.indexOf(x) === i; }); }
function picJoin(arr) { return arr.filter(function (x, i, a) { return x && a.indexOf(x) === i; }).join(', '); }
function picChips(v) { var a = picsOf(v); return a.length ? a.map(function (n) { return '<span class="pic-chip">' + esc(n) + '</span>'; }).join('') : '<span class="faint">Belum Ada</span>'; }
// checkbox list of names + "add a new name" box; the chosen names go into a hidden input "pic"
function picField(v) {
  var cur = picsOf(v), names = picList(); cur.forEach(function (n) { if (names.indexOf(n) < 0) names.push(n); });
  return '<div class="field full" data-field="pic"><label>PIC <span class="hint" style="display:inline">· bisa pilih lebih dari satu</span></label>' +
    '<div class="pic-pick" id="picPick">' + names.map(function (n) { return '<label class="pic-opt"><input type="checkbox" class="pic-cb" value="' + esc(n) + '"' + (cur.indexOf(n) > -1 ? ' checked' : '') + (canEdit() ? '' : ' disabled') + '> ' + esc(n) + '</label>'; }).join('') + '</div>' +
    (canEdit() ? '<div class="pic-new"><input class="input" id="picNewName" placeholder="Tambah nama PIC baru" maxlength="60"><button type="button" class="btn sm" data-act="pic-add-inline">+ Tambah</button> <a href="#" data-act="manage-pics" class="hint">Kelola Nama PIC</a></div>' : '') +
    '<input type="hidden" id="f-pic" name="pic" value="' + esc(picJoin(cur)) + '"><span class="msg" hidden></span></div>';
}
function picSync() {
  var h = document.getElementById('f-pic'); if (!h) return;
  h.value = picJoin([].map.call(document.querySelectorAll('#picPick .pic-cb:checked'), function (c) { return c.value; }));
}
function picAddInline() {
  var el = document.getElementById('picNewName'), n = (el && el.value || '').trim(); if (!n) { if (el) el.focus(); return; }
  if (!db.settings.pics.some(function (x) { return x.toLowerCase() === n.toLowerCase(); })) { db.settings.pics.push(n); persist(db); }
  var box = document.getElementById('picPick'), ex = [].filter.call(box.querySelectorAll('.pic-cb'), function (c) { return c.value.toLowerCase() === n.toLowerCase(); })[0];
  if (ex) ex.checked = true;
  else { var l = document.createElement('label'); l.className = 'pic-opt'; l.innerHTML = '<input type="checkbox" class="pic-cb" value="' + esc(n) + '" checked> ' + esc(n); box.appendChild(l); }
  el.value = ''; picSync(); toast('"' + n + '" ditambahkan ke daftar PIC');
}
function picDialog(id) {
  var t = taskById(id); if (!t) return;
  openModal('<form id="picForm" novalidate><div class="modal-h"><h3>PIC · ' + esc(t.name) + '</h3><button type="button" class="btn ghost sm" data-act="modal-cancel" aria-label="Close">✕</button></div><div class="modal-b one">' + picField(t.pic) + '</div>' +
    '<div class="modal-f"><div class="right"><button type="button" class="btn" data-act="modal-cancel">Batal</button><button type="submit" class="btn primary">Simpan</button></div></div></form>', 'sm');
  document.getElementById('picForm').onsubmit = function (e) { e.preventDefault(); picSync(); t.pic = document.getElementById('f-pic').value; t.updatedAt = Date.now(); closeModal(); commit('PIC → ' + (t.pic || 'kosong')); };
}
function tlKey(t) { return (t.start || t.deadline || '9999-99-99') + '|' + (t.deadline || '9999-99-99'); }
/* ---------- Column filters: every header in the Task table can be filtered ---------- */
var EMPTY_LABEL = '(kosong)';
function customColByKey(k) { return colList('tasks').filter(function (c) { return c.custom && c.key === k; })[0] || null; }
function colFilterKind(key) { return 'set'; }   // every header: pick one or more values
function taskPayLabel(t) {
  var fins = finForTask(t.id);
  if (!fins.length) return 'Tidak Ada Budget';
  var types = fins.map(function (f) { return payType(f.paymentStatus); });
  if (types.every(function (x) { return x === 'paid'; })) return 'Lunas';
  return types.some(function (x) { return x !== 'unpaid'; }) ? 'Sebagian Dibayar' : 'Belum Dibayar';
}
// values a task has in a column: [{ v: shown text, k: sort key }]
// sort key that follows the order set in Manage Categories (unlisted values go last, A–Z)
function listRank(list, v) { var i = (list || []).indexOf(v); return i > -1 ? String(10000 + i) : '2' + String(v).toLowerCase(); }
function colVals(key, t) {
  var out = [];
  function add(v, k) { if (v != null && String(v) !== '') out.push({ v: String(v), k: String(k == null ? v : k).toLowerCase() }); }
  switch (key) {
    case 'name': add(t.name); break;
    case 'notes': add(t.notes); break;
    case 'category': add(t.category, listRank(db.settings.taskCategories, t.category)); break;
    case 'workstream': taskWorkstreams(t).concat(taskFinWs(t)).forEach(function (w) { if (out.every(function (x) { return x.v !== w; })) add(w, listRank(db.settings.workstreams, w)); }); break;
    case 'pic': picsOf(t.pic).forEach(function (n) { add(n, listRank(db.settings.pics, n)); }); break;
    case 'status': add(t.status, String(1000 + statusList().indexOf(t.status))); break;
    case 'start': case 'deadline': if (t[key]) add(fmtDMY(t[key]), t[key]); break;
    case 'source': add(t.source === 'verify' ? 'Needs Verification' : 'Confirmed'); break;
    case 'payment': add(taskPayLabel(t)); break;
    default:
      if (key.indexOf('cf:') === 0) {
        var col = customColByKey(key.slice(3)), v = col ? cfVal(t, col.key) : null;
        if (col && v != null && v !== '' && v !== false) {
          if (col.type === 'checkbox') add('Ya');
          else if (col.type === 'date') add(fmtDate(v), v);
          else if (col.type === 'money') add(rp(+v), String(1e12 + (+v)));
          else if (col.type === 'number') add(v, String(1e12 + (+v)));
          else add(v);
        }
      }
  }
  return out.length ? out : [{ v: EMPTY_LABEL, k: '\uffff' }];
}
function activeColFilters() {
  var vis = {};
  visibleCols('tasks').forEach(function (c) { vis[c.custom ? 'cf:' + c.key : c.key] = 1; });
  var F = ui.colF || {};
  return Object.keys(F).filter(function (k) { var f = F[k]; return vis[k] && f && (f.t === 'text' ? String(f.v || '').trim() : (f.v || []).length); });
}
function colFilterActive() { return activeColFilters().length > 0; }
function colFilterOk(t) {
  var keys = activeColFilters();
  for (var i = 0; i < keys.length; i++) {
    var f = ui.colF[keys[i]], vals = colVals(keys[i], t).map(function (x) { return x.v; });
    if (f.t === 'text') { if (vals.join(' ').toLowerCase().indexOf(String(f.v).trim().toLowerCase()) < 0) return false; }
    else if (!f.v.some(function (x) { return vals.indexOf(x) > -1; })) return false;
  }
  return true;
}
function filterBtn(key, label) {
  var f = (ui.colF || {})[key], on = f && (f.t === 'text' ? String(f.v || '').trim() : (f.v || []).length);
  var chev = '<svg viewBox="0 0 10 6" width="10" height="6" aria-hidden="true"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  return '<button type="button" class="hf-btn' + (on ? ' on' : '') + '" data-act="col-filter" data-key="' + esc(key) + '" data-label="' + esc(label) + '" aria-label="Filter ' + esc(label) + (on ? ' (aktif)' : '') + '" title="Filter ' + esc(label) + (on ? ' (aktif)' : '') + '">' + chev + '</button>';
}
var hfPop = null, hfKey = '', hfQuiet = 0;
function closeColFilter() { if (hfPop) { hfPop.remove(); hfPop = null; hfKey = ''; } }
function setColFilter(key, kind, v) {
  ui.colF = ui.colF || {};
  if (kind === 'text' ? !String(v).trim() : !v.length) delete ui.colF[key]; else ui.colF[key] = { t: kind, v: v };
  hfQuiet = Date.now() + 900;   // render() restores scroll positions; that must not close the popup
  render();
}
function openColFilter(key, btn) {
  if (hfPop && hfKey === key) { closeColFilter(); return; }
  closeColFilter();
  hfKey = key;
  var kind = colFilterKind(key), label = btn.getAttribute('data-label') || '';
  var pop = document.createElement('div');
  pop.className = 'hf-pop'; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', 'Filter ' + label);
  document.body.appendChild(pop); hfPop = pop;
  var first;
  if (kind === 'text') {
    var cur = ui.colF[key] && ui.colF[key].v || '';
    pop.innerHTML = '<div class="hf-t">Filter ' + esc(label) + '</div><input class="input" id="hfText" type="search" placeholder="Berisi kata…" value="' + esc(cur) + '"><div class="hf-foot"><button type="button" class="btn sm ghost" data-hf="clear">Hapus Filter</button></div>';
    first = pop.querySelector('#hfText');
    first.addEventListener('input', function () { setColFilter(key, 'text', first.value); });
  } else {
    var counts = {}, order = {};
    db.tasks.forEach(function (t) { colVals(key, t).forEach(function (x) { counts[x.v] = (counts[x.v] || 0) + 1; if (!(x.v in order)) order[x.v] = x.k; }); });
    var values = Object.keys(counts).sort(function (a, b) { return order[a] < order[b] ? -1 : order[a] > order[b] ? 1 : 0; });
    pop.innerHTML = '<div class="hf-t">Filter ' + esc(label) + '</div>' + (values.length > 8 ? '<input class="input" id="hfSearch" type="search" placeholder="Cari nilai…">' : '') +
      '<div class="hf-list" id="hfList"></div><div class="hf-foot"><button type="button" class="btn sm ghost" data-hf="all">Pilih Semua yang Tampil</button><button type="button" class="btn sm ghost" data-hf="clear">Hapus Filter</button></div>';
    var list = pop.querySelector('#hfList'), search = pop.querySelector('#hfSearch');
    var draw = function () {
      var q = search ? search.value.trim().toLowerCase() : '', sel = ui.colF[key] && Array.isArray(ui.colF[key].v) ? ui.colF[key].v : [];
      list.innerHTML = values.filter(function (v) { return !q || v.toLowerCase().indexOf(q) > -1; }).map(function (v) {
        return '<label class="hf-opt"><input type="checkbox" value="' + esc(v) + '"' + (sel.indexOf(v) > -1 ? ' checked' : '') + '> <span class="hf-v">' + esc(v) + '</span><span class="hf-n">' + counts[v] + '</span></label>';
      }).join('') || '<div class="faint" style="padding:6px">Tidak Ada Nilai</div>';
    };
    draw();
    if (search) search.addEventListener('input', draw);
    pop.addEventListener('click', function (e) {
      if (!e.target.closest('[data-hf="all"]')) return;
      var q = search ? search.value.trim().toLowerCase() : '', cur = ui.colF[key] && Array.isArray(ui.colF[key].v) ? ui.colF[key].v.slice() : [];
      values.forEach(function (v) { if ((!q || v.toLowerCase().indexOf(q) > -1) && cur.indexOf(v) < 0) cur.push(v); });
      setColFilter(key, 'set', cur); draw();
    });
    list.addEventListener('change', function (e) {
      var c = e.target; if (!c || c.type !== 'checkbox') return;
      var sel = (ui.colF[key] && Array.isArray(ui.colF[key].v) ? ui.colF[key].v : []).filter(function (x) { return x !== c.value; });
      if (c.checked) sel.push(c.value);
      setColFilter(key, 'set', sel);
    });
    first = search || list.querySelector('input');
  }
  pop.addEventListener('click', function (e) {
    if (e.target.closest('[data-hf="clear"]')) { setColFilter(key, kind, kind === 'text' ? '' : []); closeColFilter(); }
  });
  var r = btn.getBoundingClientRect(), w = pop.offsetWidth, hgt = pop.offsetHeight;
  pop.style.left = Math.max(8, Math.min(r.left, window.innerWidth - w - 8)) + 'px';
  pop.style.top = (r.bottom + 6 + hgt > window.innerHeight - 8 ? Math.max(8, r.top - hgt - 6) : r.bottom + 6) + 'px';
  if (first) first.focus({ preventScroll: true });
}
document.addEventListener('click', function (e) { var dn = e.target.closest && e.target.closest('.dl-box'); if (dn) { var di = dn.querySelector('.dl-native'); if (di && !di.disabled && di.showPicker) { e.preventDefault(); try { di.showPicker(); } catch (er) { di.focus(); } } } });
document.addEventListener('click', function (e) { if (hfPop && !e.target.closest('.hf-pop') && !e.target.closest('.hf-btn')) closeColFilter(); });
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeColFilter(); });
window.addEventListener('scroll', function (e) { if (hfPop && Date.now() >= hfQuiet && !(e.target && e.target.nodeType === 1 && e.target.closest && e.target.closest('.hf-pop'))) closeColFilter(); }, true);
window.addEventListener('resize', closeColFilter);

/* ---------- v10: lebar kolom bisa diatur (drag tepi kanan judul kolom) ----------
   Lebar disimpan per browser (localStorage), per tabel (tasks / finance), per kolom.
   Klik 2x garis pemisah = kembalikan kolom itu ke lebar awal. */
var COLW_KEY = 'gx27.colw.v1', RZ_MIN = 48, rzDrag = null, rzEatUntil = 0;
var colW = (function () { try { var v = JSON.parse(localStorage.getItem(COLW_KEY) || '{}'); return v && typeof v === 'object' ? v : {}; } catch (e) { return {}; } })();
function colwSave() { try { localStorage.setItem(COLW_KEY, JSON.stringify(colW)); } catch (e) {} }
function rzKeyOf(th, i) { return th.getAttribute('data-ck') || ('#' + i); }
function rzHeads(tb) { var r = tb.tHead && tb.tHead.rows[0]; return r ? [].slice.call(r.cells) : []; }
function rzCols(tb, n) {
  var cg = tb.querySelector(':scope > colgroup');
  if (!cg) { cg = document.createElement('colgroup'); tb.insertBefore(cg, tb.firstChild); }
  while (cg.children.length < n) cg.appendChild(document.createElement('col'));
  return [].slice.call(cg.children, 0, n);
}
// lock every column to a pixel width (saved width, else its current width) so only the dragged one changes
function rzFix(tb, ths, saved) {
  var widths = ths.map(function (th, i) { var w = saved && saved[rzKeyOf(th, i)]; return w ? w : Math.max(RZ_MIN, Math.round(th.getBoundingClientRect().width) || 120); });
  var cols = rzCols(tb, ths.length), sum = 0;
  widths.forEach(function (w, i) { cols[i].style.width = w + 'px'; sum += w; });
  tb.classList.add('rz-on'); tb.style.width = sum + 'px';
  return widths;
}
function rzApply(root) {
  (root || document).querySelectorAll('table[data-rz]').forEach(function (tb) {
    var key = tb.getAttribute('data-rz'), ths = rzHeads(tb); if (!ths.length) return;
    ths.forEach(function (th) {
      if (th.querySelector('.col-rz')) return;
      var s = document.createElement('span'); s.className = 'col-rz'; s.setAttribute('aria-hidden', 'true');
      s.title = 'Geser untuk ubah lebar kolom · klik 2x untuk reset';
      th.appendChild(s);
    });
    var saved = colW[key], wrap = tb.closest('.table-wrap');
    if (saved && ths.some(function (th, i) { return saved[rzKeyOf(th, i)]; })) {
      rzFix(tb, ths, saved);
      if (wrap && !(wrap.previousElementSibling && wrap.previousElementSibling.classList.contains('rz-bar')))
        wrap.insertAdjacentHTML('beforebegin', '<div class="rz-bar"><button type="button" class="btn ghost sm" data-rzreset="' + esc(key) + '">↺ Reset Lebar Kolom</button></div>');
    }
  });
}
document.addEventListener('pointerdown', function (e) {
  var hd = e.target.closest && e.target.closest('.col-rz'); if (!hd || (e.button && e.button !== 0)) return;
  e.preventDefault(); e.stopPropagation();
  var th = hd.parentNode, tb = th.closest('table'), ths = rzHeads(tb), key = tb.getAttribute('data-rz');
  var widths = rzFix(tb, ths, colW[key]), idx = ths.indexOf(th);
  rzDrag = { tb: tb, ths: ths, key: key, idx: idx, widths: widths, cols: rzCols(tb, ths.length), x: e.clientX, w0: widths[idx], hd: hd, moved: false };
  try { hd.setPointerCapture(e.pointerId); } catch (er) {}
  hd.classList.add('active'); document.body.classList.add('rz-dragging');
}, true);
document.addEventListener('pointermove', function (e) {
  if (!rzDrag) return;
  var d = rzDrag, w = Math.max(RZ_MIN, Math.round(d.w0 + e.clientX - d.x));
  if (Math.abs(e.clientX - d.x) > 2) d.moved = true;
  d.widths[d.idx] = w; d.cols[d.idx].style.width = w + 'px';
  d.tb.style.width = d.widths.reduce(function (a, b) { return a + b; }, 0) + 'px';
});
function rzEnd() {
  if (!rzDrag) return;
  var d = rzDrag; rzDrag = null;
  d.hd.classList.remove('active'); document.body.classList.remove('rz-dragging');
  if (!d.moved) return;
  var m = colW[d.key] = colW[d.key] || {};
  d.ths.forEach(function (th, i) { m[rzKeyOf(th, i)] = d.widths[i]; });
  colwSave(); rzEatUntil = Date.now() + 350;
  // other tables sharing this key (e.g. one table per station) follow right away
  document.querySelectorAll('table[data-rz="' + d.key + '"]').forEach(function (tb) { if (tb !== d.tb) rzFix(tb, rzHeads(tb), colW[d.key]); });
  var wrap = d.tb.closest('.table-wrap');
  if (wrap && !(wrap.previousElementSibling && wrap.previousElementSibling.classList.contains('rz-bar')))
    wrap.insertAdjacentHTML('beforebegin', '<div class="rz-bar"><button type="button" class="btn ghost sm" data-rzreset="' + esc(d.key) + '">↺ Reset Lebar Kolom</button></div>');
}
document.addEventListener('pointerup', rzEnd);
document.addEventListener('pointercancel', rzEnd);
// a drag must not also sort the column / open a row
document.addEventListener('click', function (e) {
  if (Date.now() < rzEatUntil || (e.target.closest && e.target.closest('.col-rz'))) { e.preventDefault(); e.stopPropagation(); return; }
  var rb = e.target.closest && e.target.closest('[data-rzreset]');
  if (rb) { e.preventDefault(); e.stopPropagation(); delete colW[rb.getAttribute('data-rzreset')]; colwSave(); render(); toast('Lebar kolom dikembalikan ke awal'); }
}, true);
document.addEventListener('dblclick', function (e) {
  var hd = e.target.closest && e.target.closest('.col-rz'); if (!hd) return;
  e.preventDefault(); e.stopPropagation();
  var th = hd.parentNode, tb = th.closest('table'), key = tb.getAttribute('data-rz'), ths = rzHeads(tb), m = colW[key];
  if (!m) return;
  delete m[rzKeyOf(th, ths.indexOf(th))];
  if (!Object.keys(m).length) delete colW[key];
  colwSave(); render();
}, true);

// header cell: [label ↑] [▾ filter] on one tidy row
function thCell(inner, extra, cls, attrs) {
  return '<th' + (cls ? ' class="' + cls + '"' : '') + (attrs || '') + '><div class="th-in"><span class="th-l">' + inner + '</span>' + (extra ? extra : '') + '</div></th>';
}
function sortTh(key, label, cls, extra) {
  var on = ui.sort.key === key;
  return thCell(label + (on ? '<span class="arr">' + (ui.sort.dir > 0 ? '↑' : '↓') + '</span>' : ''), extra, 'sortable ' + (cls || ''),
    ' data-act="sort" data-key="' + key + '" aria-sort="' + (on ? (ui.sort.dir > 0 ? 'ascending' : 'descending') : 'none') + '"');
}
function taskTable(list, compact, showBlockers) {
  var cols = visibleCols('tasks').filter(function (c) { return !(compact && c.key === 'workstream'); });
  var SORTABLE = { name: 1, workstream: 1, category: 1, deadline: 1, pic: 1, status: 1, start: 1, source: 1 };
  var W = { name: 24, workstream: 13, category: 12, start: 11, deadline: 13, pic: 10, status: 16, notes: 20, source: 10, payment: 16 };
    var wt = cols.reduce(function (a, c) { return a + (W[c.key] || 11); }, 0) || 1;
    var colg = '<colgroup>' + cols.map(function (c) { return '<col style="width:' + ((W[c.key] || 11) / wt * 100).toFixed(2) + '%">'; }).join('') + '</colgroup>';
    var h = '<div class="table-wrap"><table class="task-table" data-rz="tasks">' + colg + '<thead><tr>' + cols.map(function (c) {
    var fk = c.custom ? 'cf:' + c.key : c.key, fb = filterBtn(fk, c.label), ck = ' data-ck="' + esc(fk) + '"';
    if (c.custom) return sortTh('cf:' + c.key, esc(c.label), c.type === 'number' || c.type === 'money' ? 'r' : '', fb).replace('<th', '<th' + ck);
    return (SORTABLE[c.key] ? sortTh(c.key, esc(c.label), '', fb) : thCell(esc(c.label), fb)).replace('<th', '<th' + ck);
  }).join('') + '</tr></thead><tbody>';
  list.forEach(function (t) {
    var exp = ui.expanded === t.id;
    h += '<tr class="row' + (exp ? ' expanded' : '') + '" data-act="expand" data-id="' + t.id + '" aria-expanded="' + exp + '">' + cols.map(function (c) { return c.custom ? cfCell('tasks', c, t) : taskCell(c.key, t); }).join('') + '</tr>';
    if (exp) h += '<tr class="expanded"><td colspan="' + cols.length + '">' + taskDetail(t) + '</td></tr>';
    if (taskFinOpen(t)) taskFinRows(t).forEach(function (f) {
      h += '<tr class="fin-sub" data-act="edit-fin" data-id="' + f.id + '" title="Buka item budget: ' + esc(f.item) + '">' + cols.map(function (c) { return c.custom ? '<td></td>' : finSubCell(c.key, f, t); }).join('') + '</tr>';
    });
  });
  return h + '</tbody></table></div>';
}
/* Finance & Procurement items inside the task list: every budget item linked to a task is listed under that task
   as its own row (with its own workstream), so All Tasks shows every item from Finance. */
function taskFinItems(t) {
  return finForTask(t.id).sort(function (a, b) {
    var pa = a.parentId ? 1 : 0, pb = b.parentId ? 1 : 0;
    return pa - pb || rowOrder(a, b);
  });
}
// rows worth listing: skip a single item that is just the task itself (same name)
function taskFinHasRows(t) {
  var l = finForTask(t.id);
  return l.length > 1 || (l.length === 1 && String(l[0].item || '').trim().toLowerCase() !== String(t.name || '').trim().toLowerCase());
}
function taskFinOpen(t) {
  if (ui.tfHide || !taskFinHasRows(t)) return false;
  var o = (ui.tfOpen || {})[t.id];
  return o === undefined ? true : !!o;
}
// while filtering by workstream or searching, only the items that match are listed
function taskFinRows(t) {
  var list = taskFinItems(t);
  var F = (ui.colF || {}).workstream, wsF = F && Array.isArray(F.v) && F.v.length && activeColFilters().indexOf('workstream') > -1 ? F.v : null;
  if (wsF) {
    var wsHit = list.filter(function (f) { return wsF.indexOf(f.workstream || EMPTY_LABEL) > -1; });
    if (wsHit.length) list = wsHit;     // e.g. filter "Games": only the game items; the task matched on its own workstream → all its items
  }
  var q = (ui.q || '').trim().toLowerCase();
  if (q && String(t.name || '').toLowerCase().indexOf(q) < 0) {
    var hit = list.filter(function (f) { return [f.item, f.workstream, f.notes].join(' ').toLowerCase().indexOf(q) > -1; });
    if (hit.length) list = hit;
  }
  return list;
}
function taskFinWs(t) {
  var out = [];
  finForTask(t.id).forEach(function (f) { if (f.workstream && out.indexOf(f.workstream) < 0) out.push(f.workstream); });
  return out;
}
function finSubCell(key, f, t) {
  var c = calc(f);
  switch (key) {
    case 'name':
      var kind = f.kind === 'vendor' ? 'Vendor Invoice' : f.kind === 'allocation' ? 'Alokasi Dana' : f.parentId ? 'Item Invoice' : 'Item Budget';
      return '<td class="fs-name"><span class="fs-ind" aria-hidden="true">↳</span><span class="fs-body"><span class="fs-item">' + esc(f.item || '(tanpa nama)') + '</span><span class="fs-meta">' + kind + ' · ' + rp(c.est != null ? c.est : c.base) + (f.qty ? ' · ' + esc(f.qty) + (f.unit ? ' ' + esc(f.unit) : '') : '') + '</span></span></td>';
    case 'workstream': return '<td>' + wsTag(f.workstream || '') + '</td>';
    case 'category': return '<td class="muted fs-cat">Item Finance</td>';
    case 'start': return '<td><span class="faint">—</span></td>';
    case 'deadline': return '<td class="fs-due">' + (f.paymentDeadline ? fmtDMY(f.paymentDeadline) : (c.inherited && c.parent && c.parent.paymentDeadline ? '<span class="faint">' + fmtDMY(c.parent.paymentDeadline) + '</span>' : '<span class="faint">—</span>')) + '</td>';
    case 'pic': return '<td><span class="faint">—</span></td>';
    case 'status': return '<td>' + (c.inherited ? '<span class="faint fs-via">Via Invoice</span>' : payBadge(f.paymentStatus)) + '</td>';
    case 'notes': return '<td class="muted">' + (f.notes ? esc(f.notes) : '<span class="faint">—</span>') + '</td>';
    case 'source': return '<td>' + srcTag(f.source) + '</td>';
    case 'payment':
      if (c.inherited) return '<td class="pay-cell"><span class="faint" title="Dibayar lewat ' + esc((c.parent || {}).item || 'vendor invoice') + '">Termasuk Invoice Vendor</span></td>';
      if (c.allocation) return '<td class="pay-cell"><span>Sisa dana <b class="num">' + rp(c.fundLeft) + '</b></span></td>';
      return '<td class="pay-cell"><span class="' + (c.outstanding > 0 ? 'pc-out' : 'pc-ok') + '">Sisa <b class="num">' + rp(c.outstanding) + '</b></span></td>';
  }
  return '<td></td>';
}
function taskCell(key, t) {
  switch (key) {
    case 'name':
      var nfin = finForTask(t.id).length, finTag = '';
      if (nfin && taskFinHasRows(t)) {
        var fo = taskFinOpen(t);
        finTag = '<button type="button" class="src fin fin-tog" data-act="task-fin-toggle" data-id="' + t.id + '" aria-expanded="' + fo + '" title="' + (fo ? 'Sembunyikan' : 'Tampilkan') + ' item Finance">' + (fo ? '▾' : '▸') + ' Finance · ' + nfin + ' Item</button> ';
      } else if (nfin) finTag = '<span class="src fin" title="Tertaut ke Finance &amp; Procurement">Finance · ' + nfin + ' Item</span> ';
      var alc = canEdit() ? allocForTask(t) : null;
      return '<td><span class="tname">' + esc(t.name) + '</span><span class="tsub">' + finTag + (t.notes ? esc(t.notes.split('\n')[0]) + ' · ' : '') + srcTag(t.source) + '</span>' +
        (alc ? '<button type="button" class="btn sm ghost task-add-sub" data-act="new-sub" data-id="' + alc.id + '" title="Tambah pemakaian dana di bawah ' + esc(alc.item) + '">+ Sub Item</button>' : '') + '</td>';
    case 'workstream': return '<td>' + wsTags(t) + '</td>';
    case 'category': return '<td class="muted" style="white-space:nowrap">' + esc(t.category) + '</td>';
    case 'start': return '<td>' + (t.start ? fmtDMY(t.start) : '<span class="faint">—</span>') + '</td>';
    case 'deadline':
      if (!canEdit()) return '<td class="dl-cell">' + (t.deadline ? '<span class="dl-ro">' + fmtDMY(t.deadline) + '</span>' : '<span class="faint">—</span>') + '</td>';
      var ds = dueState(t), dsub = ds.kind === 'overdue' ? '<span class="due overdue">' + (-ds.days) + ' hari lewat</span>' : ds.kind === 'soon' ? '<span class="due soon">' + (ds.days === 0 ? 'hari ini' : 'dalam ' + ds.days + ' hari') + '</span>' : '';
      return '<td class="dl-cell"><label class="dl-box' + (t.deadline ? '' : ' empty') + '"><span class="dl-text">' + (t.deadline ? fmtDMY(t.deadline) : 'dd/mm/yyyy') + '</span><svg class="dl-ico" viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><rect x="2" y="3" width="12" height="11" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M2 6.5h12M5 1.5v3M11 1.5v3" stroke="currentColor" stroke-width="1.4"/></svg><input class="dl-native" type="date" data-inline="deadline" data-id="' + t.id + '" value="' + esc(t.deadline || '') + '" title="Deadline" aria-label="Deadline ' + esc(t.name) + '"></label>' + (dsub ? '<span class="dl-sub">' + dsub + '</span>' : '') + '</td>';
    case 'pic':
      return '<td class="pic-cell' + (canEdit() ? ' can-edit' : '') + '"><div class="pic-wrap">' + picChips(t.pic) + '</div>' + (canEdit() ? '<button type="button" class="pic-edit" data-act="pick-pic" data-id="' + t.id + '" aria-label="' + (picsOf(t.pic).length ? 'Ubah' : 'Pilih') + ' PIC ' + esc(t.name) + '" title="' + (picsOf(t.pic).length ? 'Ubah PIC' : 'Pilih PIC') + '"><svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M11.3 2.3a1.4 1.4 0 0 1 2 2L5.6 12 2.5 13.5 4 10.4z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg></button>' : '') + '</td>';
    case 'status': return '<td><select class="inline-select st-' + esc(statusDef(t.status).color) + '" data-inline="status" data-id="' + t.id + '" aria-label="Status for ' + esc(t.name) + '">' + opts(withCurrent(statusList(), t.status), t.status) + '</select></td>';
    case 'notes': return '<td style="max-width:260px" class="muted">' + (t.notes ? esc(t.notes) : '<span class="faint">—</span>') + '</td>';
    case 'source': return '<td>' + srcTag(t.source) + '</td>';
    case 'payment':
      // paid so far, what is still outstanding, and which items are due when
      var fins = finForTask(t.id);
      if (!fins.length) return '<td><span class="faint">—</span></td>';
      var viaVendor = fins.filter(function (f) { return calc(f).inherited; });
      if (viaVendor.length === fins.length) {
        var vp = calc(viaVendor[0]).parent;
        return '<td class="pay-cell">' + payBadge(vp.paymentStatus) + '<div class="pc-sum"><span class="faint">dibayar lewat ' + esc(vp.item) + '</span></div></td>';
      }
      fins = fins.filter(function (f) { return !calc(f).inherited; });
      var tt = totals(fins), allPaid = fins.every(function (f) { return payType(f.paymentStatus) === 'paid'; }), anyPaid = fins.some(function (f) { return payType(f.paymentStatus) !== 'unpaid'; });
      var due = fins.map(function (f) { return { f: f, c: calc(f) }; })
        .filter(function (x) { return !x.c.inherited && !x.c.allocation && x.c.outstanding > 0; })
        .sort(function (a, b) { return (a.f.paymentDeadline || '9999') < (b.f.paymentDeadline || '9999') ? -1 : 1; });
      var today = todayISO();
      var dueHtml = due.slice(0, 3).map(function (x) {
        var d = x.f.paymentDeadline, late = d && d < today;
        return '<li><span class="pc-item" title="' + esc(x.f.item) + '">' + esc(x.f.item || '(tanpa nama)') + '</span><b class="num">' + rp(x.c.outstanding) + '</b> ' +
          (d ? '<span class="due ' + (late ? 'overdue' : (daysBetween(today, d) <= 3 ? 'soon' : '')) + '">due ' + fmtDate(d, true) + (late ? ' · lewat' : '') + '</span>' : '<span class="faint pc-nodue">due date belum diisi</span>') + '</li>';
      }).join('') + (due.length > 3 ? '<li class="faint">+' + (due.length - 3) + ' item lain</li>' : '');
      return '<td class="pay-cell">' + payBadge(fins.length === 1 ? fins[0].paymentStatus : allPaid ? payFirst('paid') : anyPaid ? payFirst('partial') : payFirst('unpaid')) +
        '<div class="pc-sum"><span>Dibayar <b class="num">' + rp(tt.paid) + '</b></span><span class="' + (tt.outstanding > 0 ? 'pc-out' : 'pc-ok') + '">Sisa <b class="num">' + rp(tt.outstanding) + '</b></span></div>' +
        (dueHtml ? '<ul class="pc-due">' + dueHtml + '</ul>' : '') + '</td>';
  }
  return '<td></td>';
}
function taskDetail(t) {
  var fins = finForTask(t.id);
    var finInh = fins.filter(function (f) { return calc(f).inherited; }), finOwn = fins.filter(function (f) { return !calc(f).inherited; });
    if (!finOwn.length) { finOwn = fins; finInh = []; }
    var finHtml = finOwn.length ? finOwn.map(function (f) {
      var c = calc(f);
      return '<div class="fin-item"><span><a href="#finance" data-act="edit-fin" data-id="' + f.id + '">' + esc(f.item) + '</a><br>' + payBadge(f.paymentStatus) + ' ' + invBadge(f.invoiceStatus) + '</span><span class="num r" style="text-align:right">' + rp(c.base) + '<br><span class="muted" style="font-size:12px">sisa ' + rp(c.outstanding) + '</span></span></div>';
    }).join('') + (finInh.length ? '<details class="fin-incl"><summary>' + finInh.length + ' item termasuk di invoice di atas</summary>' + finInh.map(function (f) {
      return '<div class="fin-item"><span><a href="#finance" data-act="edit-fin" data-id="' + f.id + '">' + esc(f.item) + '</a> ' + invBadge(f.invoiceStatus) + '</span><span class="num r" style="text-align:right">' + rp(calc(f).est) + '</span></div>';
    }).join('') + '</details>' : '') : '<p class="faint">No finance record linked.</p>';
  return '<div class="detail">' +
    '<div><h4>Notes</h4><p>' + (t.notes ? esc(t.notes) : '<span class="faint">—</span>') + '</p></div>' +

    '<div><h4>Finance (Payment Tracked Separately)</h4>' + finHtml + '</div>' +
    '<div class="actions"><button class="btn sm primary" data-act="edit-task" data-id="' + t.id + '">' + (canEdit() ? 'Edit Task' : 'View Details') + '</button><button class="btn sm" data-act="new-fin" data-task="' + t.id + '">+ Item Budget Baru</button><button class="btn sm" data-act="link-fin" data-id="' + t.id + '">Link Item Finance</button>' +
    (allocForTask(t) && canEdit() ? '<button class="btn sm" data-act="new-sub" data-id="' + allocForTask(t).id + '">+ Sub Item</button>' : '') +
    '<button class="btn sm danger" data-act="delete-task" data-id="' + t.id + '">Delete</button><span class="faint" style="font-size:12px;align-self:center;margin-left:auto">' + t.id + ' · ' + esc(taskWorkstreams(t).join(', ')) + ' · ' + (t.start ? 'start ' + fmtDate(t.start, true) + ' · ' : '') + 'updated ' + new Date(t.updatedAt).toLocaleDateString('id-ID') + '</span></div></div>';
}
function renderTimeline(list) {
  var dated = list.filter(function (t) { return t.deadline; }), undated = list.filter(function (t) { return !t.deadline; });
  var byMonth = {};
  dated.forEach(function (t) { var m = t.deadline.slice(0, 7); (byMonth[m] = byMonth[m] || []).push(t); });
  var today = todayISO(), h = '';
  Object.keys(byMonth).sort().reverse().forEach(function (m) {
    var items = byMonth[m].sort(function (a, b) { return a.deadline < b.deadline ? 1 : a.deadline > b.deadline ? -1 : String(a.name).localeCompare(String(b.name)); });
    var byDay = {};
    items.forEach(function (t) { var label = fmtRange(t); (byDay[label] = byDay[label] || { key: t.deadline, end: t.deadline, items: [] }).items.push(t); });
    var d = parseISO(m + '-01');
    h += '<div class="tl-month"><h3>' + MONTHS_FULL[d.getMonth()] + ' ' + d.getFullYear() + '</h3>';
    Object.keys(byDay).sort(function (a, b) { return byDay[a].key < byDay[b].key ? 1 : byDay[a].key > byDay[b].key ? -1 : (a < b ? -1 : 1); }).forEach(function (label) {
      var g = byDay[label], isEvent = g.end === EVENT_DATE && g.items.every(function (t) { return t.category === 'Event Day'; });
      var past = g.end < today;
      h += '<div class="tl-day' + (isEvent ? ' tl-event' : '') + '"><div class="tl-date' + (past ? ' past' : '') + '"><span class="dot"></span>' + label.toUpperCase() + '</div><div class="tl-items">' +
        g.items.map(function (t) {
          return '<div class="tl-item" data-act="open-task" data-id="' + t.id + '" role="button" tabindex="0">' + wsTags(t) + '<span>' + esc(t.name) + (t.notes ? ' <span class="' + (isEvent ? '' : 'muted') + '" style="opacity:.75">· ' + esc(t.notes.split('\n')[0]) + '</span>' : '') + '</span>' + statusBadge(t.status) + '</div>';
        }).join('') + '</div></div>';
    });
    h += '</div>';
  });
  if (undated.length) h += '<div class="tl-month"><h3>No Deadline Yet</h3><div class="tl-items">' + undated.map(function (t) { return '<div class="tl-item" data-act="open-task" data-id="' + t.id + '" role="button" tabindex="0">' + wsTags(t) + '<span>' + esc(t.name) + ' ' + srcTag(t.source) + '</span>' + statusBadge(t.status) + '</div>'; }).join('') + '</div></div>';
  return h;
}

/* ---------- Finance ---------- */
function filteredFinance() {
  var q = ui.finQ.trim().toLowerCase();
  var match = function (f) {
    if (ui.finWs && f.workstream !== ui.finWs) return false;
    if (ui.finPay && f.paymentStatus !== ui.finPay) return false;
    if (ui.finInv && f.invoiceStatus !== ui.finInv) return false;
    if (finDueActive() && !finDueMatch(f)) return false;
    if (q) { var t = taskById(f.taskId); if ([f.item, f.workstream, f.notes, f.receipt, f.invoiceRef, f.id, f.sheetRow, t ? t.name : ''].concat(Object.keys(f.cf || {}).map(function (k) { return f.cf[k]; })).join(' ').toLowerCase().indexOf(q) < 0) return false; }
    return true;
  };
  var hit = {}; db.finance.forEach(function (f) { if (match(f)) hit[f.id] = 1; });
  // keep vendor groups together: a matching line item brings its vendor row, a matching vendor row brings its line items
  db.finance.forEach(function (f) { if (hit[f.id] && f.parentId) hit[f.parentId] = hit[f.parentId] || 2; });
  db.finance.forEach(function (f) { if (f.parentId && hit[f.parentId] === 1 && !ui.finPay && !ui.finInv && !finDueActive()) hit[f.id] = hit[f.id] || 1; });
  return db.finance.filter(function (f) { return hit[f.id]; });
}
/* v15: Due Date filter (Finance). ui.finDue = { m: '' | 'on' | 'range' | 'overdue' | 'none', a: on/from date, b: to date }.
   A line item inside a vendor invoice uses the invoice's due date and payment status. Works together with every other filter. */
function finDue() { var d = ui.finDue; return d && typeof d === 'object' ? d : { m: '', a: '', b: '' }; }
function finDueActive() { var d = finDue(); return d.m === 'overdue' || d.m === 'none' || ((d.m === 'on' || d.m === 'range') && !!(d.a || d.b)); }
function finDueOf(f) { var c = calc(f), src = c.inherited && c.parent ? c.parent : f; return { due: src.paymentDeadline || '', paid: payType(src.paymentStatus) === 'paid' }; }
function finDueMatch(f) {
  var d = finDue(), x = finDueOf(f);
  if (d.m === 'none') return !x.due;
  if (!x.due) return false;
  if (d.m === 'overdue') return x.due < todayISO() && !x.paid;
  if (d.m === 'on') return x.due === (d.a || d.b);
  if (d.m === 'range') { var lo = d.a, hi = d.b; if (lo && hi && lo > hi) { var t = lo; lo = hi; hi = t; } return (!lo || x.due >= lo) && (!hi || x.due <= hi); }
  return true;
}
function finDueControl() {
  var d = finDue();
  return '<span class="fin-due" role="group" aria-label="Due Date filter"><select class="select" id="finDueMode" aria-label="Due Date">' +
    [['', 'All Due Dates'], ['on', 'Due on date…'], ['range', 'Due date range…'], ['overdue', 'Overdue (unpaid)'], ['none', 'No due date']].map(function (o) { return '<option value="' + o[0] + '"' + (d.m === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select>' +
    (d.m === 'on' ? '<input class="input" type="date" id="finDueA" value="' + esc(d.a || '') + '" aria-label="Due on">' : '') +
    (d.m === 'range' ? '<input class="input" type="date" id="finDueA" value="' + esc(d.a || '') + '" aria-label="Due from"><span class="muted fin-due-to">to</span><input class="input" type="date" id="finDueB" value="' + esc(d.b || '') + '" aria-label="Due until">' : '') +
    '</span>';
}
function finCategories() {
  var order = {}, seq = 0;
  db.finance.slice().sort(rowOrder).forEach(function (f) { if (!(f.workstream in order)) order[f.workstream] = seq++; });
  return Object.keys(order).sort(function (a, b) { return order[a] - order[b]; });
}
function rowOrder(a, b) { return (a.sheetRow || 9999) - (b.sheetRow || 9999) || (a.createdAt || 0) - (b.createdAt || 0); }
// a vendor invoice with line items: the Doorprize group starts folded (the prizes are included in the invoice row), other groups start open
function finCollapsed(f) {
  if (ui.finQ || ui.finWs || ui.finPay || ui.finInv || finDueActive()) return false;      // while searching/filtering, show everything
  var o = (ui.finOpen || {})[f.id];
  return o === undefined ? f.workstream === 'Doorprize' : !o;
}
function renderFinance() {
  var all = totals(db.finance), list = filteredFinance(), meta = db.meta ? Object.assign({}, db.meta) : null;
  if (meta && db.settings.budgetSheetUrl) meta.url = db.settings.budgetSheetUrl;
  var h = pageHead('Finance &amp; Procurement', '',
    (meta && meta.url ? '<a class="btn admin-only" href="' + esc(meta.url) + '" target="_blank" rel="noopener">Open Budget Sheet ↗</a>' : '') + '<button class="btn" data-act="manage-ws">Manage Categories</button><button class="btn" data-act="manage-columns" data-table="finance">Manage Columns</button><button class="btn" data-act="import-csv">Import</button><button class="btn primary" data-act="new-fin">+ Budget Item</button>');
  if (db.budgetUpdateAvailable && canEdit()) {
    var sm = SHEET_SEED.meta || {};
    h += '<div class="banner warn" role="status"><div><b>Data budget dari sheet terbaru tersedia</b> (' + esc(sm.file || 'sheet') + ' · snapshot ' + fmtDate(sm.snapshot) + ' · ' + (SHEET_SEED.items || []).length + ' baris). ' +
      'Terapkan untuk mengganti isi Finance dengan data sheet ini; task tetap, versi lama tetap ada di Version history.' +
      '<div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap"><button class="btn sm primary" data-act="budget-apply">Terapkan Data Sheet Terbaru</button><button class="btn sm ghost" data-act="budget-ignore">Abaikan</button></div></div></div>';
  }
  var buf = bufferBudget();
  h += '<div class="kpis fin-kpis">' + kpi('Total Budget', rp(all.est), all.count + ' items' + (all.flagged ? ' · ' + all.flagged + ' need checking' : ''), false, true) +
    kpi('Paid', rp(all.paid), all.fee ? '+ ' + rp(all.fee) + ' transfer fees' : 'transfers made', false, true) +
    kpi('Outstanding Payment', rp(all.outstanding), 'invoice (or estimate) minus paid', all.outstanding > 0, true) +
    '<button type="button" class="kpi kpi-btn" data-act="buffer-detail" aria-label="Buffer Budget details"><span class="k">Buffer Budget</span><span class="v money">' + rp(buf.savings) + '</span>' +
    '<span class="s">' + buf.items.length + ' confirmed saving' + (buf.items.length === 1 ? '' : 's') + (buf.over ? ' · net ' + rp(buf.savings - buf.over) : '') + ' · view details →</span></button></div>';
  if (meta && meta.sheetSubTotal != null) {
    var dEst = all.est - meta.sheetSubTotal, dTf = (all.paid + all.fee) - meta.sheetTransferred;
    if (!dEst && !dTf) h += '<p class="fin-ok">✓ Total cocok dengan budget sheet (' + rp(meta.sheetSubTotal) + ')</p>';
    else h += '<div class="banner warn"><div><b>Rekonsiliasi dengan sheet.</b> Sub Total sheet ' + rp(meta.sheetSubTotal) + ' · app ' + rp(all.est) + (dEst ? ' (selisih ' + rp(dEst) + ')' : ' ✓') +
      '. Total transfer sheet (DP Total) ' + rp(meta.sheetTransferred) + ' · app ' + rp(all.paid + all.fee) + (dTf ? ' (selisih ' + rp(dTf) + ' — lihat baris yang di-flag)' : ' ✓') + '.</div></div>';
  }
  h += '<div class="toolbar"><input class="input search" id="finSearch" type="search" placeholder="Search item, vendor, invoice, row…" value="' + esc(ui.finQ) + '" aria-label="Search budget items">' +
    '<select class="select" id="finWs" aria-label="Category">' + opts(finCategories(), ui.finWs, 'All Categories') + '</select>' +
    '<select class="select" id="finPay" aria-label="Payment Status">' + opts(payList(), ui.finPay, 'All Payment Status') + '</select>' +
    '<select class="select" id="finInv" aria-label="Invoice Status">' + opts(INV_STATUS, ui.finInv, 'All Invoice Status') + '</select>' + finDueControl() +
    ((ui.finQ || ui.finWs || ui.finPay || ui.finInv || finDue().m) ? '<button class="btn ghost sm" data-act="clear-fin-filters">Clear Filters</button>' : '') + '</div>';
  if (!db.finance.length) return h + '<div class="table-wrap">' + emptyBox('No Budget Items Yet', 'Add an item or import your budget sheet (paste from Excel / Google Sheets).') + '</div>';
  if (!list.length) return h + '<div class="table-wrap">' + emptyBox('No Items Match', 'Try a different search or clear the filters.') + '</div>';
  var groups = {};
  list.forEach(function (f) { (groups[f.workstream] = groups[f.workstream] || []).push(f); });
  var FC = visibleCols('finance');
  var head = '<tr>' + FC.map(function (c) { var b = builtinCol('finance', c.key); return '<th data-ck="' + esc((c.custom ? 'cf:' : '') + c.key) + '"' + ((b && b.num) || c.type === 'number' || c.type === 'money' ? ' class="r"' : '') + '>' + esc(c.label) + '</th>'; }).join('') + '</tr>';
  // subtotal / total rows: label in the first column, sums under Est./Invoice/Paid/Remaining wherever they are
  function sumRow(cls, label, tot, tail) {
    return '<tr class="' + cls + '">' + FC.map(function (c, i) {
      var b = builtinCol('finance', c.key), v = b && b.total ? '<span class="num">' + rp(tot[b.total]) + '</span>' : '';
      if (i === 0) return '<td>' + label + (v ? ' · ' + v : '') + '</td>';
      if (i === FC.length - 1 && tail && !v) return '<td class="muted">' + tail + '</td>';
      return '<td' + (v ? ' class="num r"' : '') + '>' + v + '</td>';
    }).join('') + '</tr>';
  }
  var body = '';
  // vendor invoices: payment cells are merged (rowspan) over the vendor row and its line items
  var MERGE = { invoice: 1, dp: 1, paid: 1, remaining: 1, paymentDeadline: 1, invoiceStatus: 1, paymentStatus: 1, receipt: 1 };
  function row(f, child, span, underParent) {
    var c = calc(f), t = taskById(f.taskId) || (c.parent ? taskById(c.parent.taskId) : null);
    var flagHtml = (f.source === 'verify' ? '<span class="src verify" title="' + esc(f.verifyNote || 'Needs Verification') + '">Verify</span> ' : '') +
      (c.flags.length ? '<span class="flag' + (c.flags.some(function (x) { return x.lvl === 'crit'; }) ? ' crit' : '') + '" title="' + esc(c.flags.map(function (x) { return x.msg; }).join('\n')) + '">⚠ ' + c.flags.length + '</span>' : (f.source === 'verify' ? '' : '<span class="flag" style="color:var(--ok)">✓</span>'));
    var sub = [];
    if (f.kind === 'vendor') sub.push('Vendor · ' + kidsOf(f).length + ' item');
    if (f.kind === 'allocation') sub.push('Alokasi dana');
    var qtyTxt = c.qty != null ? rpFmt.format(c.qty) + (f.unit ? ' <span class="faint">' + esc(f.unit) + '</span>' : '') : '<span class="faint">—</span>';
    var pay, paid, rem, dpc, inv, ivs, rec, pd;
    if (c.inherited) {
      var via = '<span class="faint" style="font-size:12px">via vendor</span>';
      inv = dpc = paid = rem = '<span class="faint">·</span>'; ivs = pay = rec = pd = via;
    } else if (c.allocation) {
      inv = dpc = paid = '<span class="faint">—</span>';
      rem = '<span title="Terpakai ' + rp(c.used) + '">sisa ' + rp(c.fundLeft) + '</span><span class="tsub">terpakai ' + rp(c.used) + '</span>';
      ivs = pay = rec = pd = '<span class="badge b-neutral nodot">Allocation</span>';
    } else {
      inv = rp(c.inv); dpc = rp(c.dp);
      paid = rp(c.base == null && !c.paid ? null : c.paid) + (c.fee ? '<span class="tsub">+ fee ' + rp(c.fee) + '</span>' : '');
      rem = rp(c.outstanding) + (c.basedOnEstimate && c.outstanding ? '<span class="tsub" title="Invoice belum ada; dihitung dari estimasi">est.</span>' : '');
      pd = f.paymentDeadline ? '<span class="due ' + (payType(f.paymentStatus) !== 'paid' && f.paymentDeadline < todayISO() ? 'overdue' : '') + '">' + fmtDate(f.paymentDeadline, true) + '</span>' : '<span class="faint">—</span>';
      ivs = invBadge(f.invoiceStatus);
      pay = canEdit() ? '<select class="inline-select st-' + esc(payDef(f.paymentStatus).color) + '" data-inline="paystatus" data-id="' + f.id + '" aria-label="Payment status ' + esc(f.item) + '">' + opts(withCurrent(payList(), f.paymentStatus), f.paymentStatus) + '</select>' : payBadge(f.paymentStatus);
      rec = f.receipt ? '<span class="badge b-ok nodot" title="' + esc(f.receipt) + '" style="max-width:150px;overflow:hidden;text-overflow:ellipsis">' + esc(f.receipt) + '</span>' : '<span class="faint">—</span>';
    }
    var cell = {
      item: '<td class="fin-item-cell"><span class="tname">' + (child ? '<span class="sub-dot" aria-hidden="true"></span>' : '') + esc(f.item || '(tanpa nama)') + '</span>' + (sub.length ? '<span class="tsub">' + sub.join(' · ') + '</span>' : '') +
        (f.kind === 'vendor' && kidsOf(f).length ? '<button type="button" class="btn sm ghost fin-toggle" data-act="fin-toggle" data-id="' + f.id + '">' + (finCollapsed(f) ? '▸ Tampilkan ' : '▾ Sembunyikan ') + kidsOf(f).length + ' item</button> ' : '') +
          (!child && canEdit() ? '<button type="button" class="btn sm ghost add-sub" data-act="new-sub" data-id="' + f.id + '" title="Tambah sub item di bawah ' + esc(f.item) + '">+ Sub Item</button>' : '') + '</td>',
      qty: '<td class="num r">' + qtyTxt + '</td>', unitCost: '<td class="num r">' + rp(numOrNull(f.unitCost)) + '</td>', est: '<td class="num r">' + rp(c.est) + '</td>',
      invoice: '<td class="num r">' + inv + '</td>', dp: '<td class="num r">' + dpc + '</td>', paid: '<td class="num r">' + paid + '</td>', remaining: '<td class="num r">' + rem + '</td>',
      paymentDeadline: '<td>' + pd + '</td>', invoiceStatus: '<td>' + ivs + '</td>', paymentStatus: '<td>' + pay + '</td>', receipt: '<td>' + rec + '</td>',
      task: '<td class="fin-task">' + (t ? '<a href="#tasks" data-act="open-task" data-id="' + t.id + '" title="' + esc(t.name) + '">' + esc(t.name) + '</a>' : '<span class="faint">—</span>') + '</td>',
      check: '<td>' + flagHtml + '</td>'
    };
    var wc = wsColor(f.workstream);
    return '<tr class="row' + (child ? ' child' : '') + (f.kind ? ' parent' : '') + (span > 1 ? ' has-merge' : '') + '" style="--rowfg:' + wc[0] + ';--rowbg:' + wc[1] + '" data-act="edit-fin" data-id="' + f.id + '">' + FC.map(function (col) {
      if (col.custom) return cfCell('finance', col, f);
      if (MERGE[col.key] && underParent && c.inherited) return '';                       // covered by the vendor row above
      var h = cell[col.key] || '<td></td>';
      return MERGE[col.key] && span > 1 ? h.replace('<td', '<td rowspan="' + span + '" class="merged"').replace('class="merged" class="', 'class="merged ') : h;
    }).join('') + '</tr>';
  }
  var inList = {}; list.forEach(function (f) { inList[f.id] = 1; });
  finCategories().filter(function (w) { return groups[w]; }).forEach(function (w) {
    var g = groups[w].slice().sort(rowOrder), st = totals(g);
    body += '<tr class="group"><td colspan="' + FC.length + '">' + wsTag(w) + ' <span class="muted num" style="font-size:12px">' + g.length + ' item</span>' +
      (canEdit() ? ' <button type="button" class="btn sm ghost add-item" data-act="new-fin" data-ws="' + esc(w) + '">+ Item di ' + esc(w) + '</button>' : '') + '</td></tr>';
    g.forEach(function (f) {
      if (f.parentId && inList[f.parentId]) return;
      var kids = g.filter(function (k) { return k.parentId === f.id; });
      var folded = f.kind === 'vendor' && kids.length > 0 && finCollapsed(f);
        body += row(f, !!f.parentId, f.kind === 'vendor' && !folded ? 1 + kids.length : 1, false);
        if (!folded) kids.forEach(function (k) { body += row(k, true, 1, f.kind === 'vendor'); });
    });
    body += sumRow('subtotal', 'Subtotal ' + esc(w) + ' <span class="muted" style="font-weight:400">(auto)</span>', st);
  });
  var gt = totals(list);
  body += sumRow('grand', list.length === db.finance.length ? 'Grand Total' : 'Total (Filtered)', gt, gt.count + ' rows · biaya transfer ' + rp(gt.fee) + ' · ' + gt.missing + ' tanpa nominal');
  h += '<div class="table-wrap"><table class="fin-table" data-rz="finance"><thead>' + head + '</thead><tbody>' + body + '</tbody></table></div>';
  h += '<details class="fin-note"><summary>Cara Hitung</summary><p>Est. total = kolom Total Price sheet (atau qty × harga). Vendor invoice (Bali Games, BUMI, OJISAN, Doorprize) memegang invoice &amp; pembayaran; line item di bawahnya hanya rincian estimasi. Emergency Fund adalah alokasi; baris di bawahnya adalah pemakaian dana. Paid = DP / nominal transfer tanpa biaya transfer Rp2.500 (dari formula sheet). Status pembayaran tidak mengubah status operasional task.</p></details>';
  return h;
}

/* ---------- Calendar ---------- */
function renderCalendar() {
  var parts = ui.calMonth.split('-'), y = +parts[0], m = +parts[1] - 1;
  var first = new Date(y, m, 1), startOffset = (first.getDay() + 6) % 7;
  var gridStart = new Date(y, m, 1 - startOffset), today = todayISO();
  var byDate = {};
  db.tasks.forEach(function (t) { if (t.deadline) (byDate[t.deadline] = byDate[t.deadline] || []).push(t); });
  var h = pageHead('Calendar &amp; Deadlines', 'Tugas ditampilkan di tanggal deadline.' + (canEdit() ? ' Klik task untuk ubah deadline.' : ''), '<button class="btn primary" data-act="new-task">+ New Task</button>');
  var cells = '';
  for (var i = 0; i < 42; i++) {
    var d = new Date(gridStart); d.setDate(gridStart.getDate() + i);
    if (i >= 35 && d.getMonth() !== m) break;
    var iso = toISO(d), items = (byDate[iso] || []).slice().sort(function (a, b) { return a.category === 'Preparation' ? -1 : 1; });
    var cls = 'cal-cell' + (d.getMonth() !== m ? ' out' : '') + (iso === today ? ' today' : '') + (PREP_DEADLINES.indexOf(iso) > -1 ? ' prep' : '') + (iso === EVENT_DATE ? ' eventday' : '');
    cells += '<div class="' + cls + '"><div class="dn"><b>' + d.getDate() + '</b>' + (PREP_DEADLINES.indexOf(iso) > -1 ? '<span class="tag-prep">PREP</span>' : iso === EVENT_DATE ? '<span class="tag-prep" style="color:var(--fg)">EVENT</span>' : '') + '</div>' +
      items.slice(0, 4).map(chip).join('') + (items.length > 4 ? '<span class="more" data-act="cal-day" data-date="' + iso + '" role="button" tabindex="0">+' + (items.length - 4) + ' more</span>' : '') + '</div>';
  }
  var agenda = Object.keys(byDate).filter(function (k) { return k.slice(0, 7) === ui.calMonth; }).sort().map(function (k) {
    return '<div class="a-day"><h5>' + fmtDate(k) + (PREP_DEADLINES.indexOf(k) > -1 ? ' · PREP' : '') + '</h5>' + byDate[k].map(chip).join('') + '</div>';
  }).join('') || emptyBox('No Deadlines This Month', 'Use the arrows to see other months.');
  h += '<div class="cal-layout"><div><div class="cal"><div class="cal-head"><button class="btn sm" data-act="cal-prev" aria-label="Previous month">←</button><h2>' + MONTHS_FULL[m] + ' ' + y + '</h2><div style="display:flex;gap:6px"><button class="btn sm" data-act="cal-today">Today</button><button class="btn sm" data-act="cal-next" aria-label="Next month">→</button></div></div>' +
    '<div class="cal-grid cal-dows">' + ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(function (x) { return '<div class="cal-dow">' + x + '</div>'; }).join('') + '</div>' +
    '<div class="cal-grid month">' + cells + '</div><div class="agenda">' + agenda + '</div></div>' +
    '<div class="legend"><span><i style="background:var(--crit-bg);border:1px solid var(--crit)"></i>Overdue</span><span><i style="background:var(--warn-bg);border:1px solid var(--warn)"></i>Due ≤3 Days</span><span><i style="background:var(--accent)"></i>Preparation Deadline</span><span><i style="background:var(--accent-soft)"></i>Event Day</span><span style="text-decoration:line-through">Done</span></div></div>';
  var overdue = db.tasks.filter(function (t) { return dueState(t).kind === 'overdue'; }).sort(function (a, b) { return a.deadline < b.deadline ? -1 : 1; });
  var next7 = db.tasks.filter(function (t) { var s = dueState(t); return s.kind !== 'done' && s.kind !== 'none' && s.days >= 0 && s.days <= 7; }).sort(function (a, b) { return a.deadline < b.deadline ? -1 : 1; });
  function sideRow(t) { return '<div class="item"><span class="t" data-act="open-task" data-id="' + t.id + '" role="button" tabindex="0" title="' + esc(t.name) + '">' + esc(t.name) + '<br><span style="font-size:11.5px">' + wsTags(t) + ' ' + dueLabel(t) + '</span></span><input class="input" type="date" id="dl-' + t.id + '" data-inline="deadline" data-id="' + t.id + '" value="' + esc(t.deadline) + '" aria-label="Deadline for ' + esc(t.name) + '"></div>'; }
  h += '<div style="display:flex;flex-direction:column;gap:16px">' +
    panel('Overdue', overdue.length, overdue.length ? '<div class="side-list">' + overdue.map(sideRow).join('') + '</div>' : emptyBox('Nothing Overdue', 'All past deadlines are done.')) +
    panel('Next 7 Days', next7.length, next7.length ? '<div class="side-list">' + next7.map(sideRow).join('') + '</div>' : emptyBox('Clear Week', 'No deadlines in the next 7 days.')) + '</div></div>';
  return h;
}
function chip(t) {
  var s = dueState(t);
  return '<button class="chip ' + wsClass(t.workstream) + ' ' + (s.kind === 'overdue' || s.kind === 'soon' || s.kind === 'done' ? s.kind : '') + '" style="border-left-color:' + wsColor(t.workstream)[0] + '" data-act="cal-chip" data-id="' + t.id + '" title="' + esc(t.workstream + ' · ' + t.name + ' · ' + t.status) + '"><i class="sdot" style="background:' + (COLOR_VAR[statusDef(t.status).color] || 'var(--faint)') + '"></i>' + esc(t.name) + '</button>';
}

/* ================= Modals ================= */
var modalRoot = document.getElementById('modalRoot'), lastFocus = null;
function openModal(html, size, opts) {
  lastFocus = document.activeElement;
  modalRoot.innerHTML = '<div class="overlay" data-close="1"><div class="modal ' + (size || '') + '" role="dialog" aria-modal="true">' + html + '</div></div>';
  if (!canEdit() && !(opts && opts.allowReadonly)) {
    // visitors get the same form as a read-only detail view
    modalRoot.querySelectorAll('input,select,textarea').forEach(function (el) { el.disabled = true; });
    modalRoot.querySelectorAll('button[type=submit],.btn.danger,#calcPreview,.hint').forEach(function (el) { el.remove(); });
    var h3 = modalRoot.querySelector('.modal-h h3'); if (h3) h3.textContent = h3.textContent.replace(/^(Edit|New) /, '').replace(/^\w/, function (c) { return c.toUpperCase(); }) + ' · details';
    modalRoot.querySelectorAll('[data-act="modal-cancel"]').forEach(function (b) { if (b.textContent === 'Cancel') b.textContent = 'Close'; });
  }
  var f = modalRoot.querySelector('input:not([type=hidden]),select,textarea,button.primary');
  if (f) f.focus();
}
function closeModal() { modalRoot.innerHTML = ''; if (lastFocus && document.body.contains(lastFocus)) lastFocus.focus(); }
function field(name, label, input, opt) {
  opt = opt || {};
  return '<div class="field' + (opt.full ? ' full' : '') + '" data-field="' + name + '"><label for="f-' + name + '">' + label + (opt.req ? ' <span class="req">*</span>' : '') + '</label>' + input + (opt.hint ? '<span class="hint">' + opt.hint + '</span>' : '') + '<span class="msg" hidden></span></div>';
}
function inp(name, val, type, extra) { return '<input class="input" id="f-' + name + '" name="' + name + '" type="' + (type || 'text') + '" value="' + esc(val == null ? '' : val) + '" ' + (extra || '') + '>'; }
function sel(name, list, val, empty) { return '<select class="select" id="f-' + name + '" name="' + name + '">' + opts(list, val, empty) + '</select>'; }
function ta(name, val) { return '<textarea class="input" id="f-' + name + '" name="' + name + '">' + esc(val || '') + '</textarea>'; }
function showErrors(form, errs) {
  form.querySelectorAll('.field').forEach(function (f) { f.classList.remove('err'); var m = f.querySelector('.msg'); if (m) m.hidden = true; });
  Object.keys(errs).forEach(function (k) { var f = form.querySelector('[data-field="' + k + '"]'); if (f) { f.classList.add('err'); var m = f.querySelector('.msg'); m.textContent = errs[k]; m.hidden = false; } });
  var firstErr = form.querySelector('.field.err input,.field.err select,.field.err textarea'); if (firstErr) firstErr.focus();
}
function confirmDialog(title, message, yesLabel, onYes) {
  openModal('<div class="modal-h"><h3>' + esc(title) + '</h3></div><div class="modal-b one"><p style="margin:0">' + message + '</p></div><div class="modal-f"><div class="right"><button class="btn" data-act="modal-cancel">Cancel</button><button class="btn danger solid" id="confirmYes">' + esc(yesLabel) + '</button></div></div>', 'sm');
  document.getElementById('confirmYes').onclick = function () { closeModal(); onYes(); };
  document.getElementById('confirmYes').focus();
}

function withCurrent(list, v) { return v && list.indexOf(v) < 0 ? list.concat([v]) : list; }
function wsField(t) {
  var selected = taskWorkstreams(t), names = allWorkstreams();
  selected.forEach(function (w) { if (names.indexOf(w) < 0) names.push(w); });
  return '<div class="pic-pick" id="wsPick">' + names.map(function (w) {
    return '<label class="pic-opt"><input type="checkbox" class="ws-cb" value="' + esc(w) + '"' + (selected.indexOf(w) > -1 ? ' checked' : '') + '> ' + esc(w) + '</label>';
  }).join('') + '</div>' +
    (canEdit() ? '<div class="pic-new"><input class="input" id="wsNewName" placeholder="Tambah workstream baru" maxlength="60"><button type="button" class="btn sm" data-act="ws-add-inline">+ Tambah</button> <a href="#" data-act="manage-ws" class="hint">Kelola Workstream</a></div>' : '') +
    '<input type="hidden" id="f-workstreams" name="workstreams" value="' + esc(JSON.stringify(selected)) + '">';
}
function wsSync() {
  var hidden = document.getElementById('f-workstreams'), box = document.getElementById('wsPick');
  if (!hidden || !box) return;
  hidden.value = JSON.stringify([].map.call(box.querySelectorAll('.ws-cb:checked'), function (c) { return c.value; }));
}
function wsAddInline() {
  var el = document.getElementById('wsNewName'), n = (el && el.value || '').trim();
  if (!n) { if (el) el.focus(); return; }
  if (!db.settings.workstreams.some(function (x) { return x.toLowerCase() === n.toLowerCase(); })) { db.settings.workstreams.push(n); persist(db); }
  var box = document.getElementById('wsPick'), ex = [].filter.call(box.querySelectorAll('.ws-cb'), function (c) { return c.value.toLowerCase() === n.toLowerCase(); })[0];
  if (ex) ex.checked = true;
  else { var l = document.createElement('label'); l.className = 'pic-opt'; l.innerHTML = '<input type="checkbox" class="ws-cb" value="' + esc(n) + '" checked> ' + esc(n); box.appendChild(l); }
  el.value = ''; wsSync(); toast('"' + n + '" ditambahkan ke daftar workstream');
}
function taskForm(t, preset) {
  var isNew = !t; t = t || Object.assign({ name: '', workstream: '', category: 'Program Milestone', start: '2026-10-01', deadline: '', pic: '', status: defaultStatus(), notes: '', blockers: '', dependencies: '', source: 'confirmed', verifyNote: '' }, preset || {});
  var wsList = '<datalist id="wsList">' + allWorkstreams().map(function (w) { return '<option value="' + esc(w) + '">'; }).join('') + '</datalist>';
  openModal('<form id="taskForm" novalidate><div class="modal-h"><h3>' + (isNew ? 'New Task' : 'Edit Task') + '</h3><button type="button" class="btn ghost sm" data-act="modal-cancel" aria-label="Close">✕</button></div><div class="modal-b">' +
    field('name', 'Task Name', inp('name', t.name, 'text', 'maxlength="160" required'), { req: true, full: true }) +
    field('workstream', 'Workstream', wsField(t), { req: true, hint: 'Boleh pilih lebih dari satu' }) +
    field('category', 'Category', sel('category', withCurrent(taskCategories(), t.category), t.category), { hint: canEdit() ? '<a href="#" data-act="manage-categories">Manage Categories</a>' : '' }) +
    field('start', 'Start Date', inp('start', t.start, 'date'), { hint: 'Opsional, untuk rentang tanggal' }) +
    field('deadline', 'Deadline', inp('deadline', t.deadline, 'date')) +
    picField(t.pic) +
    field('status', 'Operational Status', sel('status', withCurrent(statusList(), t.status), t.status), { hint: canEdit() ? '<a href="#" data-act="manage-statuses">Kelola Status</a>' : '' }) +
    field('notes', 'Notes', ta('notes', t.notes), { full: true }) +
    field('source', 'Data Source', sel('source', [{ value: 'confirmed', label: 'Confirmed' }, { value: 'verify', label: 'Needs Verification' }], t.source)) +
    field('mt', 'Master Timeline', '<label class="pic-opt mt-check"><input type="checkbox" id="f-mt" name="mt"' + (onMaster(t) ? ' checked' : '') + '> Tampilkan di Master Timeline</label>', { hint: 'Semua workstream bisa masuk. Perlu deadline supaya muncul.' }) +
    cfFields('tasks', t) + taskFinField(t, isNew) +
    '</div><div class="modal-f">' + (isNew ? '' : '<button type="button" class="btn danger" data-act="delete-task" data-id="' + t.id + '">Delete</button>') +
    '<div class="right"><button type="button" class="btn" data-act="modal-cancel">Cancel</button><button type="submit" class="btn primary">' + (isNew ? 'Create task' : 'Save changes') + '</button></div></div></form>');
  var tfForm = document.getElementById('taskForm');
  // "+ Item Budget Baru" / "Link Item yang Ada" inside the form: save the task first, then open the finance step
  tfForm.addEventListener('click', function (e) {
    var b = e.target.closest('[data-fin-after]'); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    tfForm.dataset.after = b.getAttribute('data-fin-after');
    if (tfForm.requestSubmit) tfForm.requestSubmit(); else tfForm.onsubmit({ preventDefault: function () {}, target: tfForm });
  });
  tfForm.onsubmit = function (e) {
    e.preventDefault();
    wsSync();
    var fd = new FormData(e.target), v = {};
    fd.forEach(function (val, k) { v[k] = String(val).trim(); });
    try { v.workstreams = JSON.parse(v.workstreams || '[]'); } catch (err) { v.workstreams = []; }
    if (!Array.isArray(v.workstreams)) v.workstreams = [];
    v.workstream = v.workstreams[0] || '';   // first one kept for older data and other pages
    v.name = titleCase(v.name);
    var wantMt = v.mt === 'on'; delete v.mt;
    var addFin = v.addFin === 'on'; delete v.addFin;
    var after = tfForm.dataset.after || (addFin ? 'new' : ''); tfForm.dataset.after = '';
    function finStep(id, name) {
      if (after === 'new') finForm(null, id, { item: name });
      else if (after === 'link') linkFinDialog(id);
    }
    function setMt(o) { delete o.mt; if (wantMt !== mtDefault(o)) o.mt = wantMt; }   // only stored when it differs from the default rule
    var cfr = takeCf('tasks', v, t.cf), errs = cfr.errs;
    if (Object.keys(cfr.cf).length || t.cf) v.cf = cfr.cf;
    if (!v.name) errs.name = 'Task name is required.';
    if (!v.workstreams.length) errs.workstream = 'Pick at least one workstream.';
    if (v.start && v.deadline && v.start > v.deadline) errs.start = 'Start date is after the deadline.';
    if (Object.keys(errs).length) return showErrors(e.target, errs);
    // v14: a new task in the Emergency Fund workstream becomes a usage row (sub item) of the Emergency Fund allocation,
    // so everything stays summarised under one task ("Alokasi Emergency Fund")
    var efA = isNew ? efAlloc() : null;
    if (efA && wsBase(v.workstream) === 'Emergency Fund') {
      var at = efA.taskId ? taskById(efA.taskId) : null, now = Date.now();
      var nf = { id: nextId('F'), createdAt: now, updatedAt: now, item: v.name, workstream: efA.workstream, parentId: efA.id, kind: '', qty: null, unit: '', unitCost: null, estimated: null,
        invoice: null, dp: null, fee: null, paidAmount: null, paymentDeadline: v.deadline || '', invoiceStatus: 'Unsubmitted', paymentStatus: payFirst('unpaid'), receipt: '', invoiceRef: '',
        notes: [v.notes, v.pic ? 'PIC: ' + v.pic : ''].filter(Boolean).join('\n'), source: v.source || 'confirmed', verifyNote: '', taskId: at ? at.id : null, taskSynced: !!at };
      db.finance.push(nf);
      if (at) { ui.expanded = at.id; ui.tfOpen = ui.tfOpen || {}; ui.tfOpen[at.id] = true; }
      closeModal(); commit('Masuk sebagai sub item ' + (efA.item || 'Emergency Fund') + ' · isi nominalnya di form berikut');
      var made = finById(nf.id); if (made) finForm(made);
      return;
    }
    if (isNew) { var o = Object.assign({ id: nextId('T'), createdAt: Date.now() }, v, { updatedAt: Date.now() }); setMt(o); db.tasks.push(o); ui.expanded = o.id; closeModal(); commit('Task created'); finStep(o.id, o.name); }
    else { Object.assign(t, v, { updatedAt: Date.now() }); setMt(t); closeModal(); commit('Task saved'); finStep(t.id, t.name); }
  };
}

// Finance & Procurement block inside the task form
function taskFinField(t, isNew) {
  if (!canEdit()) return '';
  if (isNew) return field('addFin', 'Finance & Procurement', '<label class="pic-opt mt-check"><input type="checkbox" name="addFin"> Tambahkan juga ke Finance &amp; Procurement</label>',
    { full: true, hint: 'Setelah task dibuat, form item budget langsung terbuka dan otomatis ter-link ke task ini. Task dengan workstream Emergency Fund otomatis jadi sub item Emergency Fund.' });
  var fins = finForTask(t.id), al = allocForTask(t);
  var list = fins.length ? '<div class="tf-fin-list">' + fins.slice().sort(rowOrder).map(function (f) {
    return '<a href="#finance" data-act="edit-fin" data-id="' + f.id + '">' + (f.parentId ? '↳ ' : '') + esc(f.item || '(tanpa nama)') + ' <span class="muted">· ' + rp(calc(f).base) + ' · ' + esc(f.paymentStatus || '') + '</span></a>';
  }).join('') + '</div>' : '<p class="faint" style="margin:0 0 6px">Belum ada item budget yang ter-link.</p>';
  return field('finLinks', 'Finance & Procurement', list +
    '<div class="tf-fin-btns"><button type="button" class="btn sm" data-fin-after="new">+ Item Budget Baru</button><button type="button" class="btn sm" data-fin-after="link">Link Item yang Ada</button>' +
    (al ? '<button type="button" class="btn sm" data-act="new-sub" data-id="' + al.id + '">+ Sub Item ' + esc(al.item) + '</button>' : '') + '</div>',
    { full: true, hint: 'Perubahan task disimpan dulu, lalu form Finance terbuka.' });
}
function finForm(f, presetTask, preset) {
  var isNew = !f;
  f = f || Object.assign({ item: '', workstream: presetTask ? (taskById(presetTask) || {}).workstream || '' : '', qty: null, unit: '', unitCost: null, estimated: null, invoice: null, dp: null, fee: null, paidAmount: null,
    paymentDeadline: '', invoiceStatus: 'Unsubmitted', paymentStatus: payFirst('unpaid'), receipt: '', invoiceRef: '', taskId: presetTask || '', notes: '', kind: '', parentId: null, source: 'confirmed', verifyNote: '' }, preset || {});
  var taskOpts = db.tasks.slice().sort(function (a, b) { return (a.workstream + a.name).localeCompare(b.workstream + b.name); }).map(function (t) { return { value: t.id, label: t.workstream + ' · ' + t.name }; });
  var parentOpts = db.finance.filter(function (x) { return !x.parentId && x.id !== f.id; }).sort(rowOrder).map(function (x) { return { value: x.id, label: x.workstream + ' · ' + x.item }; });
  var hasKids = !isNew && kidsOf(f).length > 0;
  var wsList = '<datalist id="wsList2">' + finCategories().concat(allWorkstreams()).filter(function (v, i, a) { return a.indexOf(v) === i; }).map(function (w) { return '<option value="' + esc(w) + '">'; }).join('') + '</datalist>';
  function amt(v) { return v == null ? '' : rpFmt.format(v); }
  openModal('<form id="finForm" novalidate><div class="modal-h"><h3>' + (isNew ? 'New Budget Item' : 'Edit Budget Item') + (f.sheetRow ? ' <span class="muted" style="font:500 13px var(--f-body)">· sheet row ' + f.sheetRow + '</span>' : '') + '</h3><button type="button" class="btn ghost sm" data-act="modal-cancel" aria-label="Close">✕</button></div><div class="modal-b">' +
    field('item', 'Item', inp('item', f.item, 'text', 'maxlength="200"'), { req: true, full: true }) +
    field('workstream', 'Budget Category', inp('workstream', f.workstream, 'text', 'list="wsList2"') + wsList, { req: true }) +
    field('taskId', 'Linked Operational Task', sel('taskId', taskOpts, f.taskId, '— Not linked —'), { hint: 'Status task tidak ikut berubah saat dibayar' }) +
    field('kind', 'Row Type', sel('kind', [{ value: '', label: 'Line Item' }, { value: 'vendor', label: 'Vendor Invoice (Punya Line Item)' }, { value: 'allocation', label: 'Alokasi Dana (Punya Pemakaian)' }], f.kind || '')) +
    field('parentId', 'Part Of', sel('parentId', parentOpts, f.parentId || '', '— Standalone —'), { hint: hasKids ? 'Item ini punya baris di bawahnya, jadi tidak bisa jadi anak' : 'Pilih vendor invoice / alokasi kalau item ini rinciannya' }) +
    field('qty', 'Quantity', inp('qty', f.qty == null ? '' : f.qty, 'text', 'inputmode="decimal"')) +
    field('unit', 'Unit', inp('unit', f.unit, 'text', 'maxlength="20" placeholder="Pcs / Pack / Pax"')) +
    field('unitCost', 'Harga Satuan (Rp)', inp('unitCost', amt(f.unitCost), 'text', 'inputmode="numeric"')) +
    field('estimated', 'Total / Estimasi (Rp)', inp('estimated', amt(f.estimated), 'text', 'inputmode="numeric"'), { hint: 'Kosongkan untuk qty × harga' }) +
    field('invoice', 'Invoice Amount (Rp)', inp('invoice', amt(f.invoice), 'text', 'inputmode="numeric"')) +
    field('dp', 'DP Amount (Rp)', inp('dp', amt(f.dp), 'text', 'inputmode="numeric"')) +
    field('paidAmount', 'Total Transferred (Rp)', inp('paidAmount', amt(f.paidAmount), 'text', 'inputmode="numeric"'), { hint: 'Opsional. Isi kalau nominal transfer beda dari DP/invoice' }) +
    field('fee', 'Biaya Transfer (Rp)', inp('fee', amt(f.fee), 'text', 'inputmode="numeric"')) +
    field('paymentDeadline', 'Payment Deadline', inp('paymentDeadline', f.paymentDeadline, 'date')) +
    field('invoiceStatus', 'Invoice Status', sel('invoiceStatus', INV_STATUS, f.invoiceStatus)) +
    field('paymentStatus', 'Payment Status', sel('paymentStatus', withCurrent(payList(), f.paymentStatus), f.paymentStatus), { hint: canEdit() ? '<a href="#" data-act="manage-pay">Kelola Status Payment</a>' : '' }) +
    field('invoiceRef', 'Invoice / Quotation File', inp('invoiceRef', f.invoiceRef, 'text', 'maxlength="300"')) +
    field('receipt', 'Bukti Transfer', inp('receipt', f.receipt, 'text', 'maxlength="300" placeholder="Link Drive / nama file / no. referensi"')) +
    '<div class="calc-preview" id="calcPreview"></div><div class="calc-flags" id="calcFlags"></div>' +
    field('notes', 'Notes', ta('notes', f.notes), { full: true }) +
    field('source', 'Data Source', sel('source', [{ value: 'confirmed', label: 'Confirmed' }, { value: 'verify', label: 'Needs Verification' }], f.source)) +
    field('verifyNote', 'Verification Note', inp('verifyNote', f.verifyNote, 'text', 'maxlength="300"')) +
    cfFields('finance', f) +
    '</div><div class="modal-f">' + (isNew ? '' : '<button type="button" class="btn danger" data-act="delete-fin" data-id="' + f.id + '">Delete</button>') +
    '<div class="right"><button type="button" class="btn" data-act="modal-cancel">Cancel</button><button type="submit" class="btn primary">' + (isNew ? 'Add item' : 'Save changes') + '</button></div></div></form>', 'wide');
  var form = document.getElementById('finForm');
  function read() {
    var fd = new FormData(form), v = {}, errs = {};
    fd.forEach(function (val, k) { v[k] = String(val).trim(); });
    ['unitCost','estimated','invoice','dp','paidAmount','fee'].forEach(function (k) { var p = parseAmount(v[k]); if (!p.ok) errs[k] = p.negative ? 'Nominal tidak boleh negatif.' : 'Isi angka saja, contoh 1.500.000'; else v[k] = p.value; });
    if (v.qty === '') v.qty = null; else { var q = Number(String(v.qty).replace(',', '.')); if (isNaN(q) || q < 0) errs.qty = 'Quantity harus angka ≥ 0.'; else v.qty = q; }
    v.parentId = v.parentId || null; v.kind = v.kind || '';
    v.id = f.id;
    var cfr = takeCf('finance', v, f.cf); Object.assign(errs, cfr.errs);
    if (Object.keys(cfr.cf).length || f.cf) v.cf = cfr.cf;
    return { v: v, errs: errs };
  }
  function preview() {
    var r = read(), c = calc(r.v);
    var cells = c.inherited ? [['Est. total', rp(c.est)], ['Payment', 'dicatat di vendor invoice']] :
      c.allocation ? [['Alokasi', rp(c.est)], ['Terpakai', rp(c.used)], ['Sisa dana', rp(c.fundLeft)]] :
      [['Est. total', rp(c.est)], ['Paid', rp(c.paid)], ['Biaya transfer', rp(c.fee || null)], ['Remaining', rp(c.outstanding) + (c.basedOnEstimate && c.outstanding ? ' (est.)' : '')]];
    document.getElementById('calcPreview').innerHTML = cells.map(function (x) { return '<div><div class="k">' + x[0] + '</div><div class="v">' + x[1] + '</div></div>'; }).join('');
    document.getElementById('calcFlags').innerHTML = c.flags.map(function (x) { return '<span class="flag' + (x.lvl === 'crit' ? ' crit' : '') + '">⚠ ' + esc(x.msg) + '</span>'; }).join('');
  }
  form.addEventListener('input', preview); form.addEventListener('change', preview); preview();
  form.onsubmit = function (e) {
    e.preventDefault();
    var r = read(), v = r.v, errs = r.errs;
    delete v.id;
    if (!v.item) errs.item = 'Item name is required.';
    if (!v.workstream) errs.workstream = 'Pick or type a category.';
    if (v.taskId && !taskById(v.taskId)) errs.taskId = 'That task no longer exists.';
    if (v.parentId && hasKids) errs.parentId = 'Item ini punya baris di bawahnya. Pindahkan dulu baris-baris itu.';
    if (v.parentId && v.kind) errs.kind = 'Vendor invoice / alokasi tidak bisa jadi bagian item lain.';
    if (!v.kind && hasKids) errs.kind = 'Masih ada baris di bawah item ini, jadi tipe harus vendor invoice atau alokasi.';
    if (Object.keys(errs).length) return showErrors(form, errs);
    v.taskId = v.taskId || null;
    v.item = titleCase(v.item);
    // adding a sub item under a plain item turns that item into a group (vendor invoice) that holds the payment
    var par = v.parentId ? finById(v.parentId) : null;
    if (par && !par.kind) { par.kind = 'vendor'; par.updatedAt = Date.now(); }
    if (isNew) { db.finance.push(Object.assign({ id: nextId('F'), createdAt: Date.now(), taskSynced: !!v.taskId }, v, { updatedAt: Date.now() })); closeModal(); commit('Budget item added'); }
    else { Object.assign(f, v, { updatedAt: Date.now() }); closeModal(); commit('Budget item saved'); }
  };
}

function deleteTask(id) {
  var t = taskById(id); if (!t) return;
  var linked = finForTask(id);
  confirmDialog('Delete task?', '<b>' + esc(t.name) + '</b> will be removed permanently.' + (linked.length ? '<br><br>' + linked.length + ' linked budget item' + (linked.length > 1 ? 's stay' : ' stays') + ' in Finance, marked as not linked.' : ''), 'Delete task', function () {
    db.tasks = db.tasks.filter(function (x) { return x.id !== id; });
    linked.forEach(function (f) { f.taskId = null; f.updatedAt = Date.now(); });
    if (ui.expanded === id) ui.expanded = null;
    commit('Task deleted');
  });
}
function deleteFin(id) {
  var f = finById(id); if (!f) return;
  var kids = kidsOf(f);
  confirmDialog('Delete budget item?', '<b>' + esc(f.item) + '</b> (' + rp(calc(f).base) + ') will be removed and totals recalculated. The linked task is not changed.' +
    (kids.length ? '<br><br>' + kids.length + ' baris di bawahnya tetap disimpan sebagai item mandiri.' : ''), 'Delete item', function () {
    kids.forEach(function (k) { k.parentId = null; k.updatedAt = Date.now(); });
    db.finance = db.finance.filter(function (x) { return x.id !== id; }); commit('Budget item deleted');
  });
}
function deadlineDialog(id) {
  var t = taskById(id); if (!t) return;
  openModal('<form id="dlForm" novalidate><div class="modal-h"><h3>' + esc(t.name) + '</h3><button type="button" class="btn ghost sm" data-act="modal-cancel" aria-label="Close">✕</button></div><div class="modal-b">' +
    '<div class="field full">' + wsTags(t) + ' ' + statusBadge(t.status) + (t.notes ? '<span class="muted" style="margin-top:6px">' + esc(t.notes) + '</span>' : '') + '</div>' +
    field('start', 'Start Date', inp('start', t.start, 'date')) + field('deadline', 'Deadline', inp('deadline', t.deadline, 'date')) +
    field('status', 'Operational Status', sel('status', withCurrent(statusList(), t.status), t.status)) +
    '</div><div class="modal-f"><button type="button" class="btn" data-act="open-task" data-id="' + t.id + '">Open Full Task</button><div class="right"><button type="button" class="btn" data-act="modal-cancel">Cancel</button><button type="submit" class="btn primary">Save</button></div></div></form>', 'sm');
  document.getElementById('dlForm').onsubmit = function (e) {
    e.preventDefault();
    var s = e.target.start.value, d = e.target.deadline.value, st = e.target.status.value;
    if (s && d && s > d) return showErrors(e.target, { start: 'Start date is after the deadline.' });
    t.start = s; t.deadline = d; t.status = st; t.updatedAt = Date.now(); closeModal(); commit('Deadline updated');
  };
}
function dayDialog(iso) {
  var items = db.tasks.filter(function (t) { return t.deadline === iso; });
  openModal('<div class="modal-h"><h3>' + fmtDate(iso) + '</h3><button type="button" class="btn ghost sm" data-act="modal-cancel" aria-label="Close">✕</button></div><div class="panel-b">' + items.map(listRow).join('') + '</div>', 'sm');
}

/* ---------- Data tools ---------- */
function exportDialog() {
  var json = JSON.stringify(db, null, 2);
  openModal('<div class="modal-h"><h3>Export Backup</h3><button type="button" class="btn ghost sm" data-act="modal-cancel" aria-label="Close">✕</button></div><div class="modal-b one"><p class="muted" style="margin:0">' + db.tasks.length + ' tasks · ' + db.finance.length + ' budget items. Copy this JSON somewhere safe, or download it (download works when the site is self-hosted).</p><textarea class="input code" id="exportText" readonly>' + esc(json) + '</textarea></div><div class="modal-f"><div class="right"><button class="btn" id="dlBtn">Download .json</button><button class="btn primary" id="copyBtn">Copy JSON</button></div></div>', 'wide');
  document.getElementById('copyBtn').onclick = function () {
    var ta2 = document.getElementById('exportText');
    var p = navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(json) : Promise.reject();
    p.then(function () { toast('Backup copied'); }, function () { ta2.focus(); ta2.select(); toast('Text selected — press Ctrl/Cmd+C to copy'); });
  };
  document.getElementById('dlBtn').onclick = function () {
    try { var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' })); a.download = 'gx27-backup-' + todayISO() + '.json'; document.body.appendChild(a); a.click(); a.remove(); }
    catch (e) { toast('Download blocked here — use Copy JSON instead', true); }
  };
}
function importJsonDialog() {
  openModal('<div class="modal-h"><h3>Restore Backup</h3><button type="button" class="btn ghost sm" data-act="modal-cancel" aria-label="Close">✕</button></div><div class="modal-b one"><p class="muted" style="margin:0">Paste a backup JSON (from Export) or choose a .json file. This replaces all current data.</p><input type="file" id="jsonFile" accept=".json,application/json"><textarea class="input code" id="importText" placeholder="{ &quot;tasks&quot;: [...], &quot;finance&quot;: [...] }"></textarea><div class="form-err" id="importErr" hidden></div></div><div class="modal-f"><div class="right"><button class="btn" data-act="modal-cancel">Cancel</button><button class="btn primary" id="doImport">Replace Data</button></div></div>', 'wide');
  document.getElementById('jsonFile').onchange = function (e) { var file = e.target.files[0]; if (!file) return; var r = new FileReader(); r.onload = function () { document.getElementById('importText').value = r.result; }; r.onerror = function () { showImportErr('Could not read that file.'); }; r.readAsText(file); };
  function showImportErr(m) { var el = document.getElementById('importErr'); el.textContent = m; el.hidden = false; }
  document.getElementById('doImport').onclick = function () {
    var d;
    try { d = JSON.parse(document.getElementById('importText').value); } catch (e) { return showImportErr('This is not valid JSON: ' + e.message); }
    if (!d || !Array.isArray(d.tasks) || !Array.isArray(d.finance)) return showImportErr('Backup must contain "tasks" and "finance" arrays.');
    var bad = d.tasks.filter(function (t) { return !t.id || !t.name; }).length + d.finance.filter(function (f) { return !f.id || !f.item; }).length;
    if (bad) return showImportErr(bad + ' record(s) are missing an id or name. Fix the file and try again.');
    var count = d.tasks.length + ' tasks and ' + d.finance.length + ' budget items';
    confirmDialog('Replace all data?', 'Current data will be replaced with ' + count + '. Export a backup first if you might need it.', 'Replace Data', function () {
      db = d; db.seq = db.seq || (d.tasks.length + d.finance.length + 100); ui.expanded = null; commit('Backup restored');
    });
  };
}
var HEADER_MAP = {
  item: ['item','detail','nama item','barang','nama barang','description','deskripsi','uraian','kebutuhan'],
  workstream: ['category','kategori','workstream','pos','pos anggaran','divisi','section'],
  qty: ['qty','quantity','jumlah','jml','volume'],
  unitCost: ['unit cost','harga satuan','unit price','harga','price'],
  unit: ['unit','satuan'],
  estimated: ['total price','estimated','estimated cost','estimasi','estimasi biaya','total','total estimasi','budget','anggaran','total harga'],
  invoice: ['inv total','invoice','invoice amount','nominal invoice','tagihan','nilai invoice'],
  dp: ['dp total','dp','down payment','uang muka','nominal dp'],
  paymentDeadline: ['payment deadline','deadline','deadline pembayaran','jatuh tempo','due date','tenggat'],
  invoiceStatus: ['invoice status','status invoice'],
  paymentStatus: ['payment status','status pembayaran','status bayar','status','pembayaran'],
  receipt: ['bukti tf','receipt','transfer receipt','bukti transfer','bukti','bukti tf'],
  notes: ['notes','note','catatan','keterangan','remarks']
};
function parseDelimited(text) {
  var lines = text.replace(/\r/g, '').split('\n').filter(function (l) { return l.trim(); });
  if (!lines.length) return [];
  var delim = lines[0].indexOf('\t') > -1 ? '\t' : (lines[0].split(';').length > lines[0].split(',').length ? ';' : ',');
  return lines.map(function (line) {
    var out = [], cur = '', q = false;
    for (var i = 0; i < line.length; i++) {
      var c = line[i];
      if (q) { if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c; }
      else if (c === '"') q = true; else if (c === delim) { out.push(cur); cur = ''; } else cur += c;
    }
    out.push(cur); return out.map(function (s) { return s.trim(); });
  });
}
function importCsvDialog() {
  openModal('<div class="modal-h"><h3>Import Budget Sheet</h3><button type="button" class="btn ghost sm" data-act="modal-cancel" aria-label="Close">✕</button></div><div class="modal-b one">' +
    '<p class="muted" style="margin:0">Copy rows from Excel / Google Sheets (including the header row) and paste here. Recognised headers: Item, Category, Qty, Harga satuan, Estimasi/Total, Invoice, DP, Payment deadline, Status invoice, Status pembayaran, Bukti transfer, Notes. Rows named "Subtotal" / "Total" are skipped automatically to avoid double counting.</p>' +
    '<textarea class="input code" id="csvText" placeholder="Item\tCategory\tQty\tHarga satuan\tTotal\tDP\tStatus pembayaran"></textarea>' +
    '<label style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="csvReplace" checked> Remove empty placeholder items for the categories being imported</label>' +
    '<div id="csvPreview" class="muted" style="font-size:13px"></div><div class="form-err" id="csvErr" hidden></div></div>' +
    '<div class="modal-f"><div class="right"><button class="btn" data-act="modal-cancel">Cancel</button><button class="btn primary" id="doCsv" disabled>Import</button></div></div>', 'wide');
  var parsed = null;
  function analyse() {
    var text = document.getElementById('csvText').value, err = document.getElementById('csvErr'), pv = document.getElementById('csvPreview'), btn = document.getElementById('doCsv');
    err.hidden = true; parsed = null; btn.disabled = true; pv.textContent = '';
    if (!text.trim()) return;
    var rows = parseDelimited(text);
    if (rows.length < 2) { err.textContent = 'Need a header row plus at least one data row.'; err.hidden = false; return; }
    var head = rows[0].map(function (h) { return h.toLowerCase().replace(/\(.*?\)/g, '').replace(/rp\.?/g, '').trim(); }), map = {};
    Object.keys(HEADER_MAP).forEach(function (k) { var idx = -1; HEADER_MAP[k].some(function (alias) { idx = head.indexOf(alias); return idx > -1; }); if (idx > -1 && Object.values(map).indexOf(idx) < 0) map[k] = idx; });
    if (map.item == null) { err.textContent = 'Could not find an "Item" column. Rename the item column header to "Item".'; err.hidden = false; return; }
    var items = [], skipped = 0, problems = [], lastCat = '';
    rows.slice(1).forEach(function (r, i) {
      var name = r[map.item] || '';
      var cat = map.workstream != null ? r[map.workstream] : '';
      if (cat) lastCat = cat; else cat = lastCat;
      if (!name) return;
      if (/^(sub\s*-?\s*total|grand\s*total|total)\b/i.test(name)) { skipped++; return; }
      var rec = { item: name, workstream: matchWs(cat) || 'Uncategorized', qty: null, unitCost: null, estimated: null, invoice: null, dp: null, paymentDeadline: '', invoiceStatus: 'Unsubmitted', paymentStatus: 'Pending Payment', receipt: '', notes: '', source: 'confirmed', verifyNote: '' };
      ['unitCost','estimated','invoice','dp'].forEach(function (k) { if (map[k] == null) return; var p = parseAmount(r[map[k]]); if (p.ok) rec[k] = p.value; else problems.push('Row ' + (i + 2) + ': "' + r[map[k]] + '" in ' + k + ' is not a number'); });
      if (map.qty != null && r[map.qty]) { var q = Number(String(r[map.qty]).replace(/[^\d.,]/g, '').replace(',', '.')); if (!isNaN(q)) rec.qty = q; }
      if (map.paymentDeadline != null && r[map.paymentDeadline]) { var d = parseFlexDate(r[map.paymentDeadline]); if (d) rec.paymentDeadline = d; else problems.push('Row ' + (i + 2) + ': date "' + r[map.paymentDeadline] + '" not recognised'); }
      if (map.paymentStatus != null) { var ps = (r[map.paymentStatus] || '').toLowerCase(); var hit = payDefs().filter(function (x) { return x.name.toLowerCase() === ps; })[0]; rec.paymentStatus = hit ? hit.name : /full|lunas/.test(ps) ? payFirst('paid') : /dp/.test(ps) ? payFirst('partial') : payFirst('unpaid'); }
      if (map.invoiceStatus != null) { var is = (r[map.invoiceStatus] || '').toLowerCase(); rec.invoiceStatus = /unsub|belum|not/.test(is) || !is ? 'Unsubmitted' : 'Submitted'; }
      if (map.receipt != null) rec.receipt = r[map.receipt] || '';
      if (map.notes != null) rec.notes = r[map.notes] || '';
      if (rec.workstream === 'Uncategorized') { rec.source = 'verify'; rec.verifyNote = 'Kategori tidak ditemukan di sheet'; }
      items.push(rec);
    });
    if (!items.length) { err.textContent = 'No item rows found after skipping totals.'; err.hidden = false; return; }
    parsed = items;
    var cols = Object.keys(map).map(function (k) { return k; }).join(', ');
    pv.innerHTML = '<b style="color:var(--fg)">' + items.length + ' items ready</b> · ' + skipped + ' total/subtotal rows skipped · columns found: ' + esc(cols) + ' · sum of estimates ' + rp(totals(items).est) +
      (problems.length ? '<div class="flag crit" style="white-space:normal;margin-top:6px">' + esc(problems.slice(0, 5).join(' · ')) + (problems.length > 5 ? ' …' : '') + ' (those cells are left empty)</div>' : '');
    btn.disabled = false;
  }
  document.getElementById('csvText').addEventListener('input', analyse);
  document.getElementById('doCsv').onclick = function () {
    if (!parsed) return;
    var cats = {}; parsed.forEach(function (r) { cats[r.workstream] = 1; });
    if (document.getElementById('csvReplace').checked) db.finance = db.finance.filter(function (f) { return !(f.placeholder && cats[f.workstream] && calc(f).base == null); });
    parsed.forEach(function (r) {
      var task = db.tasks.filter(function (t) { return t.workstream === r.workstream && t.category === 'Procurement'; })[0];
      db.finance.push(Object.assign({ id: nextId('F'), taskId: null, createdAt: Date.now(), updatedAt: Date.now() }, r));
    });
    closeModal(); ui.page = 'finance'; commit(parsed.length + ' budget items imported');
  };
}
function matchWs(cat) {
  if (!cat) return '';
  var c = cat.toLowerCase().trim(), list = allWorkstreams();
  for (var i = 0; i < list.length; i++) if (list[i].toLowerCase() === c || wsBase(list[i]).toLowerCase() === c) return list[i];
  var aliases = { 'design':'Design & Production','production':'Design & Production','produksi':'Design & Production','game':'Games & Competition','games':'Games & Competition','connect':'GX Connect','got talent':'GX Got Talent','talent':'GX Got Talent','hyrox':'HYROX','entertainment':'Entertainment','hiburan':'Entertainment','tenant':'Tenants','doorprize':'Doorprize','door prize':'Doorprize','hadiah':"Winners' Prizes",'prize':"Winners' Prizes",'winner':"Winners' Prizes",'pengadaan':'Procurement','procurement':'Procurement','emergency':'Emergency Fund','dana darurat':'Emergency Fund','mobile legends':'Mobile Legends','mlbb':'Mobile Legends' };
  for (var k in aliases) if (c.indexOf(k) > -1) return wsCurrent(aliases[k]);
  return cat.trim();
}

/* ================= Toast ================= */
var toastTimer;
function toast(msg, isErr) {
  var r = document.getElementById('toastRoot');
  r.innerHTML = '<div class="toast' + (isErr ? ' err' : '') + '" role="status">' + esc(msg) + '</div>';
  clearTimeout(toastTimer); toastTimer = setTimeout(function () { r.innerHTML = ''; }, 2600);
}

/* ================= Events ================= */
function go(page) { ui.page = page; try { history.replaceState(null, '', '#' + page); } catch (e) {} render(); main.focus({ preventScroll: true }); window.scrollTo(0, 0); }
document.getElementById('nav').addEventListener('click', function (e) { var b = e.target.closest('button[data-page]'); if (b) go(b.dataset.page); });
document.getElementById('menuBtn').addEventListener('click', function () { var s = document.getElementById('sidebar'); s.classList.toggle('tools-open'); this.setAttribute('aria-expanded', s.classList.contains('tools-open')); });
document.getElementById('sideTools').addEventListener('click', function (e) {
  var b = e.target.closest('[data-tool]'); if (!b) return;
  var tool = b.dataset.tool;
  if (tool === 'export') exportDialog();
  else if (tool === 'import-json') importJsonDialog();
  else if (tool === 'import-csv') importCsvDialog();
  else if (tool === 'reset') confirmDialog('Reset to initial data?', 'All tasks and budget items will be replaced with the original GX27 timeline and empty budget categories. Your edits will be lost unless you exported a backup.', 'Reset data', function () { db = seed(); ui.expanded = null; storageError = ''; commit('Data reset'); });
});
var MUTATING = ['link-fin','ws-add-inline','manage-ws','new-sub','pick-pic','pic-add-inline','manage-pay','manage-pics','manage-columns','col-add','col-delete','col-move','col-show','new-task','new-milestone','new-event-item','delete-task','new-fin','delete-fin','import-csv','new-rundown','edit-rundown','delete-rundown','new-zone','delete-zone','manage-categories','manage-statuses','budget-apply','budget-ignore','cat-add','cat-delete','cat-move','cat-adopt'];
function handleAct(el, e) {
  var act = el.dataset.act, id = el.dataset.id;
  if (MUTATING.indexOf(act) > -1 && !canEdit()) { toast('Hanya admin yang bisa mengubah data.', true); return; }
  switch (act) {
    case 'new-task': taskForm(null); break;
    case 'rd-toggle': ui.rdOpen = ui.rdOpen === id ? null : id; render(); break;
    case 'rd-open': rdOpenDialog(id); break;
    case 'new-zone': zoneForm(null); break;
    case 'edit-zone': zoneForm(zoneById(id)); break;
    case 'delete-zone': closeModal(); deleteZone(id); break;
    case 'rd-clear': ui.rdQ = ''; ui.rdLoc = ''; render(); break;
    case 'new-rundown': rundownForm(null); break;
    case 'edit-rundown': closeModal(); if (rdById(id)) rundownForm(rdById(id)); break;
    case 'delete-rundown': closeModal(); deleteRundown(id); break;
    case 'manage-categories': e.preventDefault(); closeModal(); categoryManager('category'); break;
    case 'manage-statuses': e.preventDefault(); closeModal(); statusManager(); break;
    case 'manage-pics': e.preventDefault(); closeModal(); categoryManager('pic'); break;
    case 'manage-ws': e.preventDefault(); closeModal(); categoryManager('workstream'); break;
    case 'manage-pay': e.preventDefault(); closeModal(); payManager(); break;
    case 'pick-pic': picDialog(id); break;
    case 'pic-add-inline': picAddInline(); break;
    case 'ws-add-inline': wsAddInline(); break;
    case 'manage-columns': e.preventDefault(); closeModal(); columnManager(el.dataset.table); break;
    case 'col-tab': if (colApply(document.querySelector('#colForm [aria-selected="true"]').dataset.table)) { persist(db); render(); } closeModal(); columnManager(el.dataset.table); break;
    case 'col-add': colAdd(el.dataset.table); break;
    case 'col-delete': colDelete(el.dataset.table, +el.dataset.idx); break;
    case 'col-move': colMove(el.dataset.table, +el.dataset.idx, +el.dataset.dir); break;
    case 'col-show': colApply(el.dataset.table); colList(el.dataset.table).forEach(function (c) { if (c.key === el.dataset.key) c.visible = true; }); persist(db); render(); closeModal(); columnManager(el.dataset.table); break;
    case 'budget-apply':
      confirmDialog('Terapkan data budget sheet terbaru?', 'Isi Finance diganti dengan ' + (SHEET_SEED.items || []).length + ' baris dari ' + esc((SHEET_SEED.meta || {}).file || 'sheet') + '. Perubahan manual di Finance setelah import terakhir akan diganti. Task, rundown, dan settings tidak berubah.' + '', 'Terapkan', function () {
        applyBudgetSeed(db); db.budgetUpdateAvailable = false; commit('Data budget sheet diterapkan · ' + db.finance.length + ' baris');
      });
      break;
    case 'budget-ignore': db.budgetIgnored = budgetSeedHash(); db.budgetUpdateAvailable = false; commit('Pembaruan sheet diabaikan'); break;
    case 'cat-tab': closeModal(); categoryManager(el.dataset.kind); break;
    case 'cat-add': catAdd(el.dataset.kind); break;
    case 'cat-delete': closeModal(); catDelete(el.dataset.kind, +el.dataset.idx); break;
    case 'cat-adopt': var Kd = CAT_KINDS[el.dataset.kind]; db.settings[Kd.key].push(el.dataset.name); persist(db); render(); closeModal(); categoryManager(el.dataset.kind); break;
    case 'cat-move':
      var Km = CAT_KINDS[el.dataset.kind], li = db.settings[Km.key], ix = +el.dataset.idx, to = ix + (+el.dataset.dir);
      if (to >= 0 && to < li.length) { var tmp = li[ix]; li[ix] = li[to]; li[to] = tmp; persist(db); render(); closeModal(); categoryManager(el.dataset.kind); }
      break;
    case 'new-milestone': taskForm(null, { category: 'Program Milestone', workstream: '', mt: true }); break;
    case 'mt-all': var wsAll = mtWorkstreams(db.tasks.filter(function (t) { return t.deadline && onMaster(t) && t.category !== 'Event Day'; })); ui.mtHide = (ui.mtHide || []).length ? [] : wsAll; render(); break;
    case 'new-event-item': taskForm(null, { category: 'Event Day', workstream: wsCurrent('Event Day'), deadline: EVENT_DATE }); break;
    case 'mt-toggle': var w = el.dataset.ws, hd = ui.mtHide || []; ui.mtHide = hd.indexOf(w) > -1 ? hd.filter(function (x) { return x !== w; }) : hd.concat([w]); render(); break;
    case 'edit-task': closeModal(); if (taskById(id)) taskForm(taskById(id)); else toast('That task no longer exists', true); break;
    case 'delete-task': closeModal(); deleteTask(id); break;
    case 'new-fin': closeModal(); finForm(null, el.dataset.task, el.dataset.ws ? { workstream: el.dataset.ws } : null); break;
    case 'fin-toggle': { var ft = finById(id); if (ft) { ui.finOpen = ui.finOpen || {}; ui.finOpen[id] = finCollapsed(ft); render(); } break; }
      case 'new-sub':
      var pf = finById(id); if (!pf) break;
      closeModal(); finForm(null, null, { parentId: pf.id, workstream: pf.workstream, taskId: '' }); break;
    case 'edit-fin': e.preventDefault(); closeModal(); if (finById(id)) finForm(finById(id)); break;
    case 'link-fin': closeModal(); linkFinDialog(id); break;
    case 'buffer-detail': bufferDialog(); break;
    case 'present-fs':
      if (document.fullscreenElement) { if (document.exitFullscreen) document.exitFullscreen(); }
      else { document.body.classList.add('present-fs'); applySidebar(); var de = document.documentElement; if (de.requestFullscreen) de.requestFullscreen().catch(function () { document.body.classList.remove('present-fs'); applySidebar(); }); }
      break;
    case 'delete-fin': closeModal(); deleteFin(id); break;
    case 'open-task':
      e.preventDefault(); closeModal();
      if (!id || !taskById(id)) { toast('That task no longer exists', true); break; }
      ui.page = 'tasks'; ui.taskView = 'all'; ui.q = ''; ui.fWs = []; ui.fStatus = []; ui.fSrc = ''; ui.expanded = id;
      go('tasks');
      setTimeout(function () { var row = main.querySelector('tr[data-id="' + id + '"]'); if (row) row.scrollIntoView({ block: 'center' }); }, 0);
      break;
    case 'go-tasks': ui.taskView = el.dataset.view; go('tasks'); break;
    case 'go-page': go(el.dataset.page); break;
    case 'task-fin-toggle': { var tt0 = taskById(id); if (tt0) { ui.tfOpen = ui.tfOpen || {}; ui.tfOpen[id] = !taskFinOpen(tt0); render(); } break; }
    case 'task-fin-all': ui.tfHide = !ui.tfHide; if (!ui.tfHide) ui.tfOpen = {}; render(); break;
    case 'task-view': ui.taskView = el.dataset.view; ui.expanded = null; render(); break;
    case 'sort': var k = el.dataset.key; ui.sort = { key: k, dir: ui.sort.key === k ? -ui.sort.dir : (k === 'deadline' ? -1 : 1) }; render(); break;
   case 'expand': {
  if (e.target.closest('select,a,button,.dl-box,.pic-cell')) return;
  var taskScrollY = window.scrollY;
  ui.expanded = ui.expanded === id ? null : id;
  render();
  requestAnimationFrame(function () {
    window.scrollTo({ top: taskScrollY, behavior: 'instant' });
  });
  break;
}
    case 'clear-filters': ui.q = ui.fSrc = ''; ui.fWs = []; ui.fStatus = []; ui.colF = {}; ui.msOpen = ''; closeColFilter(); render(); break;
    case 'col-filter': openColFilter(el.dataset.key, el); break;
    case 'ms-clear': ui[el.dataset.key] = []; render(); break;
    case 'clear-fin-filters': ui.finQ = ui.finWs = ui.finPay = ui.finInv = ''; ui.finDue = { m: '', a: '', b: '' }; render(); break;
    case 'import-csv': importCsvDialog(); break;
    case 'cal-prev': case 'cal-next':
      var p = ui.calMonth.split('-'), d = new Date(+p[0], +p[1] - 1 + (act === 'cal-next' ? 1 : -1), 1); ui.calMonth = toISO(d).slice(0, 7); render(); break;
    case 'cal-today': ui.calMonth = todayISO().slice(0, 7); render(); break;
    case 'cal-chip': if (canEdit()) deadlineDialog(id); else { closeModal(); taskForm(taskById(id)); } break;
    case 'cal-day': dayDialog(el.dataset.date); break;
    case 'modal-cancel': closeModal(); break;
  }
}
document.addEventListener('click', function (e) {
  if (e.target.matches && e.target.matches('.overlay')) { closeModal(); return; }
  if (e.target.closest && e.target.closest('[data-inline]')) return;   // editing a cell in place, not opening the row
  var el = e.target.closest('[data-act]'); if (el) handleAct(el, e);
});
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && modalRoot.innerHTML) { closeModal(); return; }
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role="button"][data-act]')) { e.preventDefault(); handleAct(e.target, e); }
});
main.addEventListener('input', function (e) {
  var t = e.target;
  if (t.id === 'taskSearch') { ui.q = t.value; render(); }
  else if (t.id === 'rdSearch') { ui.rdQ = t.value; render(); }
  else if (t.id === 'finSearch') { ui.finQ = t.value; render(); }
});
document.addEventListener('change', function (e) {
  var c = e.target.classList; if (!c) return;
  if (c.contains('pic-cb')) picSync();
  if (c.contains('ws-cb')) wsSync();
});
// multi-select dropdowns: remember which one is open across re-renders, close when clicking elsewhere
document.addEventListener('toggle', function (e) { var b = e.target; if (b.dataset && b.dataset.msBox) { if (b.open) ui.msOpen = b.dataset.msBox; else if (ui.msOpen === b.dataset.msBox) ui.msOpen = ''; } }, true);
document.addEventListener('click', function (e) { document.querySelectorAll('details.msel[open]').forEach(function (d) { if (!d.contains(e.target)) { d.open = false; ui.msOpen = ''; } }); });
document.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' && e.target.id === 'picNewName') { e.preventDefault(); picAddInline(); }
  if (e.key === 'Enter' && e.target.id === 'wsNewName') { e.preventDefault(); wsAddInline(); }
});
main.addEventListener('change', function (e) {
  var t = e.target;
  if (t.dataset.inline && !canEdit()) return;
  if (t.dataset.ms) {
    var key = t.dataset.ms, arr = (ui[key] || []).filter(function (x) { return x !== t.value; });
    if (t.checked) arr.push(t.value);
    ui[key] = arr; ui.msOpen = key; render(); return;
  }
  if (t.id === 'finDueMode' || t.id === 'finDueA' || t.id === 'finDueB') {
    var fd = Object.assign({ m: '', a: '', b: '' }, finDue());
    if (t.id === 'finDueMode') { fd.m = t.value; if (!fd.m) { fd.a = ''; fd.b = ''; } }
    else if (t.id === 'finDueA') fd.a = t.value; else fd.b = t.value;
    ui.finDue = fd; render(); return;
  }
  var map = { fSrc: 'fSrc', finWs: 'finWs', finPay: 'finPay', finInv: 'finInv', rdLoc: 'rdLoc' };
  if (map[t.id]) { ui[map[t.id]] = t.value; render(); return; }
  if (t.dataset.inline === 'cf') {
    if (!canEdit()) return;
    var tbl = t.dataset.table, rec = tbl === 'tasks' ? taskById(t.dataset.id) : finById(t.dataset.id), col = colList(tbl).filter(function (c) { return c.key === t.dataset.col; })[0];
    if (!rec || !col) return;
    var pr = parseCf(col, col.type === 'checkbox' ? t.checked : t.value);
    if (!pr.ok) { toast(col.label + ': ' + pr.msg, true); return; }
    rec.cf = rec.cf || {};
    if (pr.value == null || pr.value === false) delete rec.cf[col.key]; else rec.cf[col.key] = pr.value;
    rec.updatedAt = Date.now(); commit(col.label + ' diperbarui'); return;
  }
  if (t.dataset.inline === 'paystatus') {
    var fp = finById(t.dataset.id); if (!fp || !canEdit()) return;
    fp.paymentStatus = t.value; fp.updatedAt = Date.now(); commit('Payment → ' + t.value); return;
  }
  if (t.dataset.inline === 'pic') {
    var tp = taskById(t.dataset.id); if (!tp || !canEdit()) return;
    tp.pic = t.value; tp.updatedAt = Date.now(); commit('PIC → ' + (t.value || 'kosong')); return;
  }
  if (t.dataset.inline === 'status') {
    var task = taskById(t.dataset.id); if (!task) return;
    task.status = t.value; task.updatedAt = Date.now(); commit('Status → ' + t.value);
  } else if (t.dataset.inline === 'deadline') {
    var task2 = taskById(t.dataset.id); if (!task2) return;
    var nv = t.value, note = '';
    if (nv && task2.start && nv < task2.start) { task2.start = nv; note = ' · start date ikut disesuaikan'; }   // keep start <= deadline
    task2.deadline = nv; task2.updatedAt = Date.now();
    commit(nv ? 'Deadline → ' + fmtDate(nv, true) + ' · urutan diperbarui' + note : 'Deadline dikosongkan · task pindah ke paling bawah');
  } else if (t.dataset.inline === 'start') {
    var task3 = taskById(t.dataset.id); if (!task3) return;
    if (t.value && task3.deadline && t.value > task3.deadline) { toast('Start date setelah deadline (' + fmtDate(task3.deadline, true) + ')', true); t.value = task3.start || ''; return; }
    task3.start = t.value; task3.updatedAt = Date.now();
    commit('Start date → ' + (t.value ? fmtDate(t.value, true) : 'kosong'));
  }
});
window.addEventListener('hashchange', function () { var h = location.hash.replace('#', ''); if (['timeline','rundown','overview','tasks','finance','calendar','admin'].indexOf(h) > -1 && h !== ui.page) { ui.page = h; render(); } });
window.addEventListener('storage', function (e) { if (MODE === 'local' && e.key === STORE_KEY && e.newValue) { try { db = JSON.parse(e.newValue); render(); toast('Updated from another tab'); } catch (x) {} } });

/* ================= Public API (used by admin.js) ================= */
window.GX27App = {
  getDb: function () { return db; },
  setDb: function (d) { db = normalizeDb(d); return db; },
  render: render, commit: commit, toast: toast, go: go,
  openModal: openModal, closeModal: closeModal, confirmDialog: confirmDialog, showErrors: showErrors,
  field: field, inp: inp, sel: sel, ta: ta, esc: esc, rp: rp, fmtDate: fmtDate, todayISO: todayISO, parseFlexDate: parseFlexDate,
  seed: function () { return normalizeDb(seed()); }, normalizeDb: normalizeDb, totals: totals, taskStats: taskStats,
  categoryManager: categoryManager, columnManager: columnManager, CAT_KINDS: CAT_KINDS, catUsage: catUsage,
  exportDialog: exportDialog, importJsonDialog: importJsonDialog, importCsvDialog: importCsvDialog,
  STORE_KEY: STORE_KEY, LEGACY_KEYS: [STORE_KEY, 'gx27.dashboard.v2', 'gx27.dashboard.v1'],
  SETTINGS_DEFAULT: SETTINGS_DEFAULT, DEFAULT_LOGO: DEFAULT_LOGO,
  getMode: function () { return MODE; }, canEdit: canEdit,
  wsTag: wsTag, wsColor: wsColor, wsCurrent: wsCurrent, allWorkstreams: allWorkstreams, rzApply: rzApply,
  DRAG_GRIP: DRAG_GRIP, onReorder: function (name, fn) { REORDER_HOOKS[name] = fn; },
  setPage: function (p) { ui.page = p; }, getPage: function () { return ui.page; },
  setLive: setLive
};
/* Live indicator in the sidebar: 'live' (realtime connected) | 'polling' (fallback, checks every few seconds) | 'offline' */
var LIVE_LABEL = { live: 'Live · update otomatis', polling: 'Sinkron tiap 5 detik', offline: 'Offline · menunggu koneksi' };
function setLive(state) {
  var el = document.getElementById('liveInd'); if (!el) return;
  el.hidden = false; el.className = 'live-pill lv-' + state;
  el.innerHTML = '<i></i>' + LIVE_LABEL[state];
  el.title = state === 'live' ? 'Terhubung realtime: perubahan dari device lain langsung muncul.' : state === 'polling' ? 'Koneksi realtime belum tersambung, data dicek ulang otomatis tiap 5 detik.' : 'Tidak ada koneksi internet. Data diperbarui lagi saat online.';
}

/* ================= Boot ================= */
var PUBLIC_CACHE = 'gx27.published.cache';
function startPublic(Sync) {
  main.innerHTML = '<div class="empty" style="padding:80px 16px"><b>Memuat data…</b>Mengambil versi terbaru dari server.</div>';
  var cur = null, chan = '', down = false, timer = null, busy = null;
  function fromCache(reason) {
    try {
      var c = JSON.parse(localStorage.getItem(PUBLIC_CACHE) || 'null');
      if (c && c.data) { db = normalizeDb(c.data); storageError = reason + ' Menampilkan versi tersimpan terakhir (' + new Date(c.at).toLocaleString('id-ID') + ').'; return; }
    } catch (e) {}
    db = normalizeDb(seed()); storageError = reason + ' Menampilkan data awal.';
  }
  function stamp(p) { return p ? p.version + '|' + p.updated_at : ''; }
  function load() {
    return Sync.loadPublished().then(function (p) {
      cur = stamp(p);
      if (p && p.data) {
        db = normalizeDb(p.data); storageError = '';
        try { localStorage.setItem(PUBLIC_CACHE, JSON.stringify({ data: p.data, at: Date.now(), version: p.source_version })); } catch (e) {}
      } else { db = normalizeDb(seed()); storageError = ''; }
    });
  }
  function state() { return down || navigator.onLine === false ? 'offline' : chan === 'live' ? 'live' : 'polling'; }
  // cheap check (no data) → full reload only when the published row changed
  function check() {
    if (busy) return busy;
    busy = Sync.loadPublishedMeta().then(function (m) {
      down = false;
      if (stamp(m) !== cur) return load().then(function () { render(); toast('Konten diperbarui'); });
    }, function () { down = true; }).then(function () { busy = null; setLive(state()); }, function () { busy = null; });
    return busy;
  }
  function loop() { clearTimeout(timer); timer = setTimeout(function () { check().then(loop, loop); }, state() === 'live' ? 30000 : 5000); }
  return load().catch(function (err) { down = true; fromCache('Tidak bisa terhubung ke database (' + err.message + ').'); }).then(function () {
    render(); setLive(state());
    Sync.watch('published', function () { check(); }, function (st) { chan = st; setLive(state()); if (st === 'live') check(); });
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') check(); });
    window.addEventListener('online', function () { down = false; check(); });
    window.addEventListener('offline', function () { setLive(state()); });
    loop();
  });
}
function boot() {
  var Sync = window.GX27Sync || {}, cfg = window.GX27_CONFIG, wantAdmin = window.GX27_MODE === 'admin';
  if (Sync.ready) {
    // everyone edits the shared data directly — no login, no admin
    if (window.GX27Admin) { MODE = 'admin'; window.GX27Admin.start({ guest: true }); return; }
    MODE = 'public'; startPublic(Sync); return;
  }
  if (cfg && cfg.configured && !Sync.libLoaded) {
    // config says a database exists but we can't reach it: never fall back to an editable local copy
    MODE = 'public'; db = normalizeDb(seed());
    storageError = cfg ? 'Library database gagal dimuat. Menampilkan data awal (read-only). Coba refresh.' : 'Konfigurasi server tidak bisa dimuat. Menampilkan data awal (read-only).';
    try { var c = JSON.parse(localStorage.getItem(PUBLIC_CACHE) || 'null'); if (c && c.data) { db = normalizeDb(c.data); storageError = 'Server tidak bisa dihubungi. Menampilkan versi tersimpan terakhir.'; } } catch (e) {}
    render(); return;
  }
  // No database configured yet: original local behaviour (edits saved in this browser)
  MODE = 'local'; db = normalizeDb(load());
  if (wantAdmin) storageError = (cfg && cfg.configError) || 'Database belum dikonfigurasi. Admin panel aktif setelah SUPABASE_URL dan SUPABASE_ANON_KEY diisi di Vercel lalu redeploy (lihat README.md). Sementara ini perubahan hanya tersimpan di browser ini.';
  render();
}
boot();
})();
