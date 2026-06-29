with open("src/pages/AssetCreatePage.tsx", "r") as f:
    content = f.read()

old_select = '''<select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all">
                <option value="computers">أجهزة حاسب وملحقاتها</option>
                <option value="cars">سيارات ومركبات</option>
                <option value="equipment">معدات وآلات</option>
                <option value="furniture">أثاث ومفروشات</option>
              </select>'''

new_select = '''<input 
                type="text"
                list="asset-categories"
                value={form.category} 
                onChange={e => setForm({...form, category: e.target.value})} 
                placeholder="اختر أو اكتب التصنيف..."
                className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
              />
              <datalist id="asset-categories">
                <option value="أجهزة حاسب وملحقاتها" />
                <option value="سيارات ومركبات" />
                <option value="معدات وآلات" />
                <option value="أثاث ومفروشات" />
              </datalist>'''

content = content.replace(old_select, new_select)
content = content.replace('category: "computers",', 'category: "",')

with open("src/pages/AssetCreatePage.tsx", "w") as f:
    f.write(content)

