import { describe, expect, it } from 'vitest'
import { ageYearsAt, ageFromBirthYear, resolveAgeAtTest, isPlausibleBirthDate } from './age'

describe('ageYearsAt — edad al momento del test', () => {
  it('cumpleaños ya pasado en el año de referencia', () => {
    expect(ageYearsAt('1955-08-28', '2026-04-07')).toBe(70) // cumple en agosto → aún 70
  })
  it('cumpleaños posterior a la fecha de test', () => {
    expect(ageYearsAt('1955-04-07', '2026-04-07')).toBe(71) // mismo día → cumple
    expect(ageYearsAt('1955-04-08', '2026-04-07')).toBe(70) // un día antes → todavía 70
  })
  it('la edad cambia con la fecha de referencia (clave longitudinal)', () => {
    expect(ageYearsAt('1955-08-28', '2024-09-01')).toBe(69)
    expect(ageYearsAt('1955-08-28', '2026-09-01')).toBe(71)
  })
  it('fecha inválida → null', () => {
    expect(ageYearsAt('no-fecha', '2026-01-01')).toBeNull()
  })
})

describe('ageFromBirthYear — fallback solo-año', () => {
  it('resta de años', () => {
    expect(ageFromBirthYear(1955, 2026)).toBe(71)
  })
})

describe('resolveAgeAtTest — prioridad DOB > año > edad declarada', () => {
  it('usa DOB si está', () => {
    expect(resolveAgeAtTest({ birthDate: '1955-08-28', edad: 99 }, '2026-04-07')).toEqual({ age: 70, source: 'dob' })
  })
  it('cae a año si no hay DOB', () => {
    expect(resolveAgeAtTest({ birthYear: 1955 }, '2026-04-07')).toEqual({ age: 71, source: 'year' })
  })
  it('cae a edad declarada como último recurso (equidad: no recuerda DOB)', () => {
    expect(resolveAgeAtTest({ edad: 80 }, '2026-04-07')).toEqual({ age: 80, source: 'edad' })
  })
  it('sin nada → none', () => {
    expect(resolveAgeAtTest({}, '2026-04-07')).toEqual({ age: null, source: 'none' })
  })
})

describe('isPlausibleBirthDate', () => {
  it('rechaza edades imposibles', () => {
    expect(isPlausibleBirthDate('1955-08-28', '2026-01-01')).toBe(true)
    expect(isPlausibleBirthDate('1800-01-01', '2026-01-01')).toBe(false)
    expect(isPlausibleBirthDate('2030-01-01', '2026-01-01')).toBe(false)
  })
})
