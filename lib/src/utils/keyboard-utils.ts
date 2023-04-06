export function spacebarKey(event: KeyboardEvent): boolean {
    return event.code === 'Space' || event.keyCode === 32;
}

export function delKey(event: KeyboardEvent): boolean {
    return event.code === 'Delete' || event.keyCode === 46;
}