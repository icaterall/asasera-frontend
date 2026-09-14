import {expect,test} from 'vitest'
import {parseVideoTime,formatVideoTime,formatVideoDuration} from '../src/features/editor/video-time'
test.each([['',null],['20',20],['00:20',20],['1:02:03',3723],['٠١:٢٠',80],['۰۱:۲۰',80],['24:00:00',86400]] as const)('parses video time %s', (text,value)=>expect(parseVideoTime(text)).toBe(value))
test.each(['1:60','1:20:60','-1','1.5','24:00:01','hello','1:2:3:4','Infinity'])('rejects invalid time %s',text=>expect(parseVideoTime(text)).toBeNaN())
test('formats round-trip clip bounds',()=>{for(const value of [0,5,60,3599,3600,86400])expect(parseVideoTime(formatVideoTime(value))).toBe(value)})
test('duration shows explicit units up to hours',()=>{
 expect(formatVideoDuration(45,'en')).toBe('45 sec')
 expect(formatVideoDuration(150,'en')).toBe('2 min 30 sec')
 expect(formatVideoDuration(3723,'en')).toBe('1 hr 2 min 3 sec')
 expect(formatVideoDuration(3600,'en')).toBe('1 hr')
 expect(formatVideoDuration(150,'ar')).toContain('د')
 for(const value of [null,undefined,0,-1,NaN,Infinity])expect(formatVideoDuration(value,'en')).toBeNull()
})
