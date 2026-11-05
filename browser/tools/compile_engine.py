"""Compile this simulator's Python AST to JavaScript; no Python is shipped to browsers."""
import ast, json, pathlib
ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / 'browser' / 'dist'
def q(x): return json.dumps(x, ensure_ascii=True)
class Compiler:
    def __init__(self): self.serial=0
    def temp(self): self.serial+=1; return '$t'+str(self.serial)
    def ex(self,n):
        if n is None: return 'null'
        if isinstance(n,ast.Constant): return q(n.value)
        if isinstance(n,ast.Name): return 'e.get('+q(n.id)+')'
        if isinstance(n,ast.Attribute): return '$get('+self.ex(n.value)+','+q(n.attr)+')'
        if isinstance(n,ast.Subscript): return '$item('+self.ex(n.value)+','+self.ex(n.slice)+')'
        if isinstance(n,ast.Slice): return '$slice('+','.join(self.ex(x) for x in [n.lower,n.upper,n.step])+')'
        if isinstance(n,(ast.List,ast.Tuple,ast.Set)):
            a='['+','.join(('...$iter('+self.ex(x.value)+')') if isinstance(x,ast.Starred) else self.ex(x) for x in n.elts)+']'
            return ('$tuple('+a+')' if isinstance(n,ast.Tuple) else 'new PS('+a+')' if isinstance(n,ast.Set) else a)
        if isinstance(n,ast.Dict): return '$dict(['+','.join('['+self.ex(k)+','+self.ex(v)+']' if k else '...$entries('+self.ex(v)+')' for k,v in zip(n.keys,n.values))+'])'
        if isinstance(n,ast.BinOp): return '$bin('+q(type(n.op).__name__)+','+self.ex(n.left)+','+self.ex(n.right)+')'
        if isinstance(n,ast.UnaryOp): return '$un('+q(type(n.op).__name__)+','+self.ex(n.operand)+')'
        if isinstance(n,ast.BoolOp): return '$boolop('+q(type(n.op).__name__)+',['+','.join('()=>'+self.ex(v) for v in n.values)+'])'
        if isinstance(n,ast.Compare): return '$compare(['+','.join('()=>'+self.ex(x) for x in [n.left]+n.comparators)+'], '+q([type(x).__name__ for x in n.ops])+')'
        if isinstance(n,ast.IfExp): return '($truth('+self.ex(n.test)+')?'+self.ex(n.body)+':'+self.ex(n.orelse)+')'
        if isinstance(n,ast.Call):
            args='['+','.join('...$iter('+self.ex(x.value)+')' if isinstance(x,ast.Starred) else self.ex(x) for x in n.args)+']'
            kw='$dict(['+','.join('['+q(x.arg)+','+self.ex(x.value)+']' if x.arg else '...$entries('+self.ex(x.value)+')' for x in n.keywords)+'])'
            return '$call('+self.ex(n.func)+','+args+','+kw+')'
        if isinstance(n,ast.Lambda): return self.fn(n.args,'return '+self.ex(n.body)+';', '<lambda>')
        if isinstance(n,ast.JoinedStr): return '('+'+'.join(self.ex(x) if isinstance(x,ast.Constant) else '$fmt('+self.ex(x.value)+','+str(x.conversion)+','+self.ex(x.format_spec)+')' for x in n.values)+')'
        if isinstance(n,(ast.ListComp,ast.SetComp,ast.DictComp,ast.GeneratorExp)):
            inner='yield '+('$tuple(['+self.ex(n.key)+','+self.ex(n.value)+'])' if isinstance(n,ast.DictComp) else self.ex(n.elt))+';'
            for g in reversed(n.generators):
                for condition in reversed(g.ifs): inner='if($truth('+self.ex(condition)+')){'+inner+'}'
                t=self.temp(); inner='for(const '+t+' of $iter('+self.ex(g.iter)+')){'+self.assign(g.target,t)+inner+'}'
            v='((parent)=>{const e=new Env(parent);return (function*(){'+inner+'})();})(e)'
            if isinstance(n,ast.GeneratorExp): return v
            return ('new PD' if isinstance(n,ast.DictComp) else 'new PS' if isinstance(n,ast.SetComp) else 'Array.from')+'('+v+')'
        raise NotImplementedError(ast.dump(n))
    def fn(self,args,body,name):
        names=[x.arg for x in args.posonlyargs+args.args]
        defaults=['undefined']*(len(names)-len(args.defaults))+[self.ex(x) for x in args.defaults]
        return '$fn('+q(name)+',e,'+q(names)+',['+','.join(defaults)+'],'+q(args.vararg.arg if args.vararg else None)+','+q(args.kwarg.arg if args.kwarg else None)+','+q([a.arg for a in args.kwonlyargs])+',['+','.join(self.ex(x) if x else 'undefined' for x in args.kw_defaults)+'],e=>{'+body+'return null;})'
    def assign(self,n,v):
        if isinstance(n,ast.Name): return 'e.set('+q(n.id)+','+v+');'
        if isinstance(n,ast.Attribute): return '$set('+self.ex(n.value)+','+q(n.attr)+','+v+');'
        if isinstance(n,ast.Subscript): return '$setitem('+self.ex(n.value)+','+self.ex(n.slice)+','+v+');'
        if isinstance(n,(ast.Tuple,ast.List)):
            t=self.temp(); return '{const '+t+'=Array.from($iter('+v+'));'+''.join(self.assign(x,t+'['+str(i)+']') for i,x in enumerate(n.elts))+'}'
        raise NotImplementedError(ast.dump(n))
    def block(self,ns): return ''.join(self.st(n) for n in ns)
    def st(self,n):
        if isinstance(n,ast.Expr): return self.ex(n.value)+';\n' if not isinstance(n.value,ast.Constant) else ''
        if isinstance(n,ast.Assign):
            t=self.temp(); return '{const '+t+'='+self.ex(n.value)+';'+''.join(self.assign(x,t) for x in n.targets)+'}\n'
        if isinstance(n,ast.AnnAssign): return self.assign(n.target,self.ex(n.value)) if n.value else ''
        if isinstance(n,ast.AugAssign): return self.assign(n.target,'$aug('+q(type(n.op).__name__)+','+self.ex(n.target)+','+self.ex(n.value)+')')
        if isinstance(n,ast.Return): return 'return '+self.ex(n.value)+';'
        if isinstance(n,ast.If):
            if '__name__' in ast.unparse(n.test): return ''
            return 'if($truth('+self.ex(n.test)+')){'+self.block(n.body)+'}else{'+self.block(n.orelse)+'}\n'
        if isinstance(n,ast.For):
            if n.orelse: raise NotImplementedError('for else')
            t=self.temp(); return 'for(const '+t+' of $iter('+self.ex(n.iter)+')){'+self.assign(n.target,t)+self.block(n.body)+'}\n'
        if isinstance(n,ast.While): return 'while($truth('+self.ex(n.test)+')){'+self.block(n.body)+'}\n'
        if isinstance(n,ast.Break): return 'break;'
        if isinstance(n,ast.Continue): return 'continue;'
        if isinstance(n,ast.Pass): return ''
        if isinstance(n,ast.FunctionDef):
            if n.name=='main': return ''
            value=self.fn(n.args,self.block(n.body),n.name)
            if any(isinstance(d,ast.Name) and d.id=='staticmethod' for d in n.decorator_list): value='Object.assign('+value+',{static:true})'
            return 'e.set('+q(n.name)+','+value+');\n'
        if isinstance(n,ast.ClassDef):
            fields=[]
            for x in n.body:
                if isinstance(x,ast.AnnAssign): fields.append('['+q(x.target.id)+','+(self.ex(x.value) if x.value else 'undefined')+']')
            body=self.block([x for x in n.body if not isinstance(x,ast.AnnAssign)])
            return 'e.set('+q(n.name)+',$class('+q(n.name)+',e,['+','.join(fields)+'],'+str(bool(n.decorator_list)).lower()+',e=>{'+body+'}));\n'
        if isinstance(n,ast.Import): return ''.join('e.set('+q(x.asname or x.name)+',$import('+q(x.name)+'));' for x in n.names if x.name!='argparse')
        if isinstance(n,ast.ImportFrom): return ''.join('e.set('+q(x.asname or x.name)+',$get($import('+q(n.module)+'),'+q(x.name)+'));' for x in n.names)
        if isinstance(n,ast.Raise): return 'throw '+(self.ex(n.exc) if n.exc else '$error')+';'
        if isinstance(n,ast.Try):
            catches=''
            for i,h in enumerate(n.handlers): catches+=('else ' if i else '')+'if('+('$isinstance($error,'+self.ex(h.type)+')' if h.type else 'true')+'){'+('e.set('+q(h.name)+',$error);' if h.name else '')+self.block(h.body)+'}'
            return 'try{'+self.block(n.body)+'}catch($error){'+catches+'else{throw $error;}}'+('finally{'+self.block(n.finalbody)+'}' if n.finalbody else '')+self.block(n.orelse)
        if isinstance(n,ast.Delete): return ''.join('$del('+self.ex(x.value)+','+self.ex(x.slice)+');' for x in n.targets)
        raise NotImplementedError(ast.dump(n))
c=Compiler()
code=['// Generated from the original simulator. Rebuild with tools/compile_engine.py.\nimport {Env,PD,PS,$tuple,$dict,$slice,$iter,$entries,$get,$set,$item,$setitem,$del,$truth,$bin,$aug,$un,$boolop,$compare,$call,$fn,$class,$fmt,$isinstance,$register,$import} from "./python-runtime.js";']
for name in ['civsim','society','discoveries','epidemiology','warfare','civic','inspection','edit_commands','geography','development','systems','disasters','economy','governments','technology']:
    source=ROOT/(name+'.py')
    if not source.exists(): source=Path(__file__).resolve().parents[1]/'reference'/(name+'.py')
    tree=ast.parse(source.read_text(encoding='utf-8-sig'))
    code.append('$register('+q(name)+',e=>{'+c.block(tree.body)+'});')
code.append('export {$import,$call,$get};')
(OUT/'engine.js').write_text('\n'.join(code),encoding='utf-8')
print('Compiled twelve simulation modules to browser/dist/engine.js')

