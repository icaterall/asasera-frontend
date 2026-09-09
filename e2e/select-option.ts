import {expect,type Locator} from '@playwright/test'

/** Choose through the same visible menu used by a person, preserving raw API identifiers. */
export async function selectOption(control:Locator,value:string){
  await control.click()
  const option=control.page().locator(`[role="option"][data-option-value=${JSON.stringify(value)}]:visible`)
  await option.click()
  await expect(control).toHaveAttribute('data-select-value',value)
}
