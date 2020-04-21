# Daudi

This is a project the encompasses CRM, accounting and Sales app into one bundle.
All logic is initiated by loading fuel into quickbooks


St
![Logic Flow](/documentation/flowchart.png)

How do you load fuel into qbo? Glad you asked.
Well some ids need to be in place first, and qbo needs to be set up rith in the first place

<details>
  <summary># QBO SetUp</summary>

## 1. Locations

Enable locations, and create locations representing Each of the currently known depots within the KPC pipelime
![QBO Setup](/documentation/locations.gif)
Obtain the location ID's by using qbo API Explorer where you will query for [all Departments](https://developer.intuit.com/app/developer/qbo/docs/api/accounting/all-entities/department#query-a-department)
When all the depots are setup for the OMC in question, copy over the IDs obtained from qbo.
![Daudi Setup](/documentation/depotId.gif)

### Depot Mapping cheatsheet

CZVGfgb4iaLDA5l7BAjl - Eldoret
GaRFUjEpcM2YcKfQCLr8 - VTTI
IEUYY6BytsxKB1MzA4S7 - Kisumu
Kf2qa3DtflkqO1dQDbms - Oilcom
mKxvgC44gOZztr4rGuEk - Gulf
pcu7CtKLSydzzhg2ZLSY - Konza

<details>
