import io,sys,base64
# Builds marketing/assets/sales-video/Sales Video Slides.html (images embedded) from the slides artifact file.
# Run from heartattractor/:  python -I tools/build_sales_slides.py
R="marketing/assets/sales-video/ready"
src=io.open("funnel/sales-video-mind-map.html",encoding="utf-8").read()
imgs={"breakfast-together.jpg":"marketing/cig-assets/breakfast-together.jpg",
 "member-result.jpg":R+"/member-result.jpg","member-result-2.jpg":R+"/member-result-2.jpg",
 "feeling-result.jpg":"marketing/cig-assets/optin-feeling-result-top.jpg"}
for n in ("training","meditation","community-win","classroom","join-page","welcome-email","dm","cooking-together"):
    imgs[n+".jpg"]=R+"/"+n+".jpg"
for n,p in imgs.items():
    q='"'+n+'"'
    if q in src:
        src=src.replace(q,'"data:image/jpeg;base64,'+base64.b64encode(open(p,"rb").read()).decode()+'"')
out='<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">\n'+src+'\n</html>\n'
io.open(R+"/../Sales Video Slides.html","w",encoding="utf-8").write(out)
print(round(len(out)/1e6,2),"MB")
