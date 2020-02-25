import * as fs from 'fs'
import * as path from 'path'
import * as express from 'express'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter, StaticRouterContext } from 'react-router'

import { OrchStore } from '@orch/store'
import { StoreContext } from '@orch/react'

import { App } from '../client/app'

const port = 9001
const app = express()
const indexHtmlFile = path.resolve(__dirname, '../../webpack/index.html')

app.use('/resource', express.static(path.join(__dirname, '../../../resource')))

app.use('/build', express.static(path.join(__dirname, '../../webpack')))

app.get('/*', (req, res) => {
  const context: StaticRouterContext = {}

  const store = new OrchStore([
    [
      'model-namespace-1',
      [
        [
          '__default',
          {
            status: 'idle',
            list: [
              { id: 0, title: 'entire' },
              { id: 1, title: 'happily' },
              { id: 2, title: 'glass' },
              { id: 3, title: 'piece' },
              { id: 4, title: 'stock' },
              { id: 5, title: 'lay' },
              { id: 6, title: 'sight' },
              { id: 7, title: 'rhyme' },
              { id: 8, title: 'pictured' },
              { id: 9, title: 'underline' },
            ],
          },
        ],
      ],
    ],
    [
      'model-namespace-2',
      [
        [
          '2',
          {
            detailId: '2',
            status: 'idle',
            data: {
              id: 2,
              title: 'glass',
              details:
                'hope crew sleep pale ask more nothing tobacco already clear blew triangle paint weight plane tank hardly swing seen brave poet for beyond lay darkness tea on old machinery private paid climb review car happily national write donkey poet become village underline substance hall pair importance enough straw quiet using dig speak south structure impossible object weight thank local worth made chamber was coat total cream throw flag monkey beginning what boy compare including reader ten pie anywhere break speech trade frame air lungs entire post badly hot exactly mass shall palace base classroom poetry tales beautiful president young duty bit see all mill plates system easily today clothing degree worth pen we log it upper reader having problem generally three anything stronger thumb wall satellites older difference parts surface built use happily send about stop dish word importance movement report street tide fix afraid threw bag solar note beautiful statement loud merely drove forth back struggle learn halfway interior wonder element event outer shut captured anyone layers palace colony choose labor living coal through lunch policeman bottom speech mind meet studied band difference that bill vast younger pig guide establish quiet who explore driven younger brush number nearly broke blew each triangle solution writer easy known cover mill bag pictured somebody middle toy highway highest point happen lot perfect jump six whose customs frozen better time substance raw effort fifteen straw has wood teacher earlier burn western gulf refer describe there industry avoid announced low muscle trip follow human might spell chicken elephant men nearer height swam importance mental phrase pull party tell far driving industry selection piano magic writing triangle wore is review floor reader weak able was giving tent continued wash invented height dear yellow string blow trace was country pass social badly student bread here establish within dream mother waste cold social chemical short west voice want substance earn dish let',
            },
          },
        ],
        [
          '1',
          {
            detailId: '1',
            status: 'idle',
            data: {
              id: 1,
              title: 'happily',
              details:
                'stomach corner against fallen trap percent as silly like steep topic pupil feet purpose blew window brain barn magic hard mouse it safe agree draw salmon sit beautiful exchange steep directly hardly arrow pretty beauty origin salmon tie wool tribe up tell mine door parts she mail adult spring pencil learn massage captain am case trace hurry widely require kind steep ever pine growth fifteen seven mine animal fire make unknown nails order hit guess greatest product apart through previous tightly clearly softly upper climb powerful stage tide ill excellent color jack hunter case behind sun definition softly who food search method boy perfect except scared struck blind must interior mean judge headed sang remarkable lady chicken spirit mountain foreign living late unknown city negative member surface opposite instant dug element myself leaf horn sugar whose species silence triangle jack slope does she victory leaving shoot accident rays develop cage best kids national chapter win rapidly perfect score herself fuel forget cream income structure specific today slave spread pencil battle empty typical thing laid police nearby walk type western ancient plate actually damage lie citizen copper slight method plant seven time driving honor iron entire next promised village pond cold favorite coal popular quick offer massage pattern shown pine command smoke active climate require difficulty union mine applied herself black science forth running combine quite camp stems married everything seldom difference trap fruit social slabs changing rain done upward concerned sky deer least tobacco limited carry death positive let island pretty education attack supper low nor settle hat replied condition final zebra divide wonderful secret dangerous knowledge degree through how until fair highest else satisfied walk storm strange original stronger stick chose laugh organized hurt great stepped giant low rays art hang giving similar material rays race root for mix accurate married everything account terrible fill cow rough children barn jar rope snow accident laid flew door strength strange garden double egg unusual nervous fine divide done rocket blind heading quiet late action ordinary family poet safe eventually wave cup we blew location title sink darkness happen work package stopped wire layers real soon hurry income would being port food rubber fact extra war rope post claws jump ancient equipment lower anyone real then lower charge rubbed very lunch hour search had attention slipped which river layers promised crowd noted winter smooth memory empty save social dog sound putting according happy sentence satellites belong was same function hunter protection return flow unhappy whose pull left judge mice standard prepare closely molecular belt breathe radio must trade whose division corner ten silver field beautiful maybe pen zulu service experience price write said as ahead third tongue arrive farther order so chamber shadow egg nothing curve plural broken having sets finally becoming fruit section should progress engine journey pencil rays taught doing push truck bread fly during parts rhythm purpose notice eventually realize tent if trick know found best driving track ever they happy income asleep soft lungs bag mix source swing open best ruler lead apartment entirely contrast few numeral father distant determine silk call great lose leader storm personal lucky motion usual folks generally certain quiet motion town alike between longer party vast planned aware meal matter becoming report putting bow soil careful thirty follow said men engine means exist type lack same aside floating when perfectly helpful college daily but compass musical angle due location are silent zoo cold somehow silk everybody bright cattle muscle plane straight basic as shorter flat watch mail cookies deal loose student avoid begun dear dirt enough too did atom policeman improve excitement victory pupil put be kept daily but nodded weather practical terrible planning mountain afternoon skin finally box cake tin strike walk wheel recognize chance ear curious bee both baseball do gain seat pack dinner kept port cup energy guard skin article whole road have vegetable there gain means positive quick saw enemy mainly possible mostly fill guard on group draw long weather wing station gulf twice stairs free turn sky angle perfect hold way lay situation enemy train heart master experiment farmer ants class drive smooth higher human somebody nose wore press shop furniture respect entire bow taste part could twelve boat load national complex throat applied dead throughout me through surface children escape announced bend missing having love closely bad beginning jump dollar none such smoke route harder successful north eaten generally further possible stranger fifty calm town blow map type blood cabin putting my industry choice charge newspaper speed plain grow shoot chance darkness knew eventually progress meat correct pair chosen metal on caught seen ready zipper across straight therefore attached sleep month pony fully planned frog air themselves clean discuss camp me liquid broad announced statement personal noise future bill against thee brick greater apartment hair whistle wait creature hunter surrounded breeze recall cotton post support half why zoo fur proper separate winter carefully present particular everybody hang sure',
            },
          },
        ],
        [
          '3',
          {
            detailId: '3',
            status: 'idle',
            data: {
              id: 3,
              title: 'piece',
              details:
                'brother apartment dear couple found path detail am frame pupil present funny island sure lead better stove teeth floating eager birds how continued doctor youth own noun silk surface boat supper window melted window partly fireplace chest driven dug exact round section dirt business science kind difference will perfectly struggle cap discussion necessary thick nails top replied height stiff monkey pitch forward block again until repeat local voice zoo drew mind well farmer feet beauty dinner upon blue cold mainly great scientist search crack border you happy mud pack dark see hung hospital indicate might tent mill metal log somewhere difficulty spread fish nearest research seven bottom promised pile sit band salmon sharp',
            },
          },
        ],
      ],
    ],
  ])

  const app = renderToString(
    <StoreContext.Provider value={store}>
      <StaticRouter context={context} location={req.url}>
        <App />
      </StaticRouter>
    </StoreContext.Provider>,
  )

  fs.readFile(indexHtmlFile, 'utf8', (err, data) => {
    if (err) {
      console.error('Something went wrong:', err)
      return res.status(500).send('Oops, better luck next time!')
    }

    return res.send(data.replace('<div id="app"></div>', `<div id="app">${app}</div>`))
  })
})

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Example app listening on port ${port}!`)
})
