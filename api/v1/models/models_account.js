module.exports = models = {
    accountById: {
        name: 'account debt by id',
        text: `select 
		to_char(t.DT, 'DD.MM.YYYY hh:mm:ss.ms') dt, 
		t.USLUGA,
		'тепло' as usluga_name,
		0  IDEN_SHET, -- Если это прибор учета то отображается его номер, если нет счетчика то 0
		0  POKAZ_PRED, -- Если это прибор учета то отображаются предыдущие показания если нет прибора то 0
		0  POKAZ_TEK, -- Если это прибор учета то отображаются текущие показания если нет прибора то 0
		ls.FIO ,-- Фамилия И.О. абонента зарегистрированного за услугой поставщиком услуг
		0  TARIF, -- Тариф за оказанную услугу
		t.summa_dolg::numeric  KOPLATE, -- Сумма к оплате
		''  ADDRESS, -- Адрес абонента зарегистрированного за услугой
		0  NS, -- Единый номер лицевого счета
		s.ls, -- лицевой счет поставщика услуг.
		t.KOD_POLUCH ,-- код поставщика услуг согласно справочника организаций (ORGANIZATION)*
		o."name"  ORGANIZATION, -- Наименование организации поставщика услуг
		o.MFO, -- МФО поставщика услуг
		''  OKPO,-- ОКПО поставщика услуг
		o.BANK, -- Наименование банка поставщика услуг.
		'' R_SHET
		from public.sheta as s 
		join public.ls_shet as ls on ls.ls = s.ls
		join public.organization as o on o.id = ls.kod_org
		join public.tsa as t on t.ls = ls.ls and t.usluga = ls.usluga 
		left join public.viduslugi as u on u.np = t.usluga
		where s.ls = $1`
    }
}