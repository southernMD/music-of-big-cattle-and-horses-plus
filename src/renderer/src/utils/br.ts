export function br(str: string): number {
    if (str === 'standard') return 128000
    else if (str === 'higher') return 192000
    else if (str === 'exhigh') return 320000
    else return 999000
}
