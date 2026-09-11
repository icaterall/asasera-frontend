import {expect,type Locator} from '@playwright/test'

/** Choose through the same visible menu used by a person, preserving raw API identifiers. */
export async function selectOption(control:Locator,value:string){
  /* A labelled Select renders its trigger and, once opened, a listbox with the
     same accessible name; the trigger is the first match and the one that
     carries the chosen value. */
  const trigger=control.first()
  await trigger.click()
  const option=control.page().locator(`[role="option"][data-option-value=${JSON.stringify(value)}]:visible`)
  await option.click()
  await expect(trigger).toHaveAttribute('data-select-value',value)
}
