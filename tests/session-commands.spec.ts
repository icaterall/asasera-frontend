import {expect,it,vi} from 'vitest'
import {DurableHostCommands,SessionCommandError} from '../src/features/session/durableCommands'

it('retries a lost wheel acknowledgement with the original UUID and wheel revision',async()=>{
  const commands=new DurableHostCommands()
  const send=vi.fn().mockRejectedValueOnce(new Error('No response')).mockResolvedValue({ok:true})
  await expect(commands.run('host:wheel',{runId:7,expectedRevision:3,command:{action:'spin'}},send)).rejects.toThrow()
  await commands.run('host:wheel',{runId:7,expectedRevision:4,command:{action:'spin'}},send)
  expect(send.mock.calls[1]).toEqual(send.mock.calls[0])
  expect(send.mock.calls[0]![1]).toMatchObject({expectedRevision:3,requestId:expect.stringMatching(/^[a-f0-9-]{36}$/)})
  expect(commands.pending).toBeNull()
})

it('does not replace an uncertain action with another draw or participant edit',async()=>{
  const commands=new DurableHostCommands(),send=vi.fn().mockRejectedValue(new Error('No response'))
  await expect(commands.run('host:wheel',{runId:7,expectedRevision:3,command:{action:'spin'}},send)).rejects.toThrow()
  await expect(commands.run('host:wheel',{runId:7,expectedRevision:4,command:{action:'close'}},send)).rejects.toThrow('Retry')
  expect(send).toHaveBeenCalledTimes(1)
  send.mockResolvedValueOnce({ok:true})
  await commands.retry(send)
  expect(send.mock.calls[1]).toEqual(send.mock.calls[0])
})

it('releases definitively rejected revisions but retains storage failures for identical retry',async()=>{
  const commands=new DurableHostCommands(),send=vi.fn().mockRejectedValueOnce(new SessionCommandError('revision_conflict','Changed')).mockResolvedValue({ok:true})
  const command={action:'open' as const}
  await expect(commands.run('host:wheel',{runId:7,expectedRevision:1,command},send)).rejects.toThrow()
  expect(commands.pending).toBeNull()
  await commands.run('host:wheel',{runId:7,expectedRevision:2,command},send)
  expect(send.mock.calls[1]![1].requestId).not.toBe(send.mock.calls[0]![1].requestId)
  send.mockRejectedValueOnce(new SessionCommandError('persistence_failed','Retry'))
  await expect(commands.run('host:participant',{runId:7,participantId:'seat',command:{action:'remove'}},send)).rejects.toThrow()
  expect(commands.pending).not.toBeNull()
})

it('retains the request when the transport reports a generic server storage error',async()=>{
 const commands=new DurableHostCommands(),send=vi.fn().mockRejectedValueOnce(new SessionCommandError('request_failed','Request failed')).mockResolvedValue({ok:true})
 await expect(commands.run('host:participant',{runId:7,participantId:'seat',command:{action:'remove'}},send)).rejects.toThrow()
 await commands.retry(send)
 expect(send.mock.calls[1]).toEqual(send.mock.calls[0])
})
